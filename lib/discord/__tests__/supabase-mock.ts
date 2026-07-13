type Row = Record<string, unknown>;

export interface JoinTestStore {
  jogatinas: Row[];
  jogatina_players: Row[];
  jogatina_events: Row[];
  seasons: Row[];
}

let idCounter = 0;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function resetIdCounter() {
  idCounter = 0;
}

export function createEmptyJoinTestStore(): JoinTestStore {
  return {
    jogatinas: [],
    jogatina_players: [],
    jogatina_events: [],
    seasons: [],
  };
}

type Filter = { column: string; value: unknown; op: "eq" | "lte" };

class QueryBuilder {
  private table: keyof JoinTestStore;
  private store: JoinTestStore;
  private filters: Filter[] = [];
  private orFilter: string | null = null;
  private selectColumns = "*";
  private insertPayload: Row | Row[] | null = null;
  private updatePayload: Row | null = null;
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private mode: "select" | "insert" | "update" = "select";

  constructor(store: JoinTestStore, table: keyof JoinTestStore) {
    this.store = store;
    this.table = table;
  }

  select(columns = "*") {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ column, value, op: "lte" });
    return this;
  }

  or(filter: string) {
    this.orFilter = filter;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.mode = "insert";
    this.insertPayload = payload;
    return this;
  }

  update(payload: Row) {
    this.mode = "update";
    this.updatePayload = payload;
    return this;
  }

  private matchesOr(row: Row): boolean {
    if (!this.orFilter) return true;

    const parts = this.orFilter.split(",");
    return parts.some((part) => {
      const trimmed = part.trim();
      if (trimmed === "ended_at.is.null") {
        return row.ended_at == null;
      }
      const gteMatch = trimmed.match(/^ended_at\.gte\.(.+)$/);
      if (gteMatch) {
        const threshold = gteMatch[1];
        return row.ended_at != null && String(row.ended_at) >= threshold;
      }
      return false;
    });
  }

  private applyFilters(rows: Row[]): Row[] {
    let result = rows.filter((row) =>
      this.filters.every((f) => {
        if (f.op === "eq") return row[f.column] === f.value;
        if (f.op === "lte") {
          return String(row[f.column] ?? "") <= String(f.value);
        }
        return true;
      }),
    );

    if (this.orFilter) {
      result = result.filter((row) => this.matchesOr(row));
    }

    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      result = [...result].sort((a, b) => {
        const av = String(a[column] ?? "");
        const bv = String(b[column] ?? "");
        return ascending ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }

    if (this.limitCount != null) {
      result = result.slice(0, this.limitCount);
    }

    return result;
  }

  private pickColumns(row: Row): Row {
    if (this.selectColumns === "*") return { ...row };

    const columns = this.selectColumns
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const picked: Row = {};
    for (const col of columns) {
      if (col in row) picked[col] = row[col];
    }
    return picked;
  }

  private assertUniqueActiveJogatina(payload: Row): { message: string; code: string } | null {
    if (this.table !== "jogatinas") return null;
    if (payload.is_current !== true || payload.source !== "discord_bot") return null;

    const conflict = this.store.jogatinas.find(
      (row) =>
        row.game_id === payload.game_id &&
        row.is_current === true &&
        row.source === "discord_bot",
    );

    if (!conflict) return null;

    return {
      code: "23505",
      message:
        'duplicate key value violates unique constraint "idx_one_active_jogatina_per_game"',
    };
  }

  async single(): Promise<{ data: Row | null; error: { message: string; code?: string } | null }> {
    const result = await this.execute();
    if (result.error) {
      return { data: null, error: result.error };
    }

    const rows = Array.isArray(result.data)
      ? result.data
      : result.data
        ? [result.data]
        : [];

    if (rows.length === 0) {
      return { data: null, error: { message: "No rows found" } };
    }
    if (rows.length > 1) {
      return { data: null, error: { message: "Multiple rows found" } };
    }
    return { data: rows[0], error: null };
  }

  async maybeSingle(): Promise<{
    data: Row | null;
    error: { message: string; code?: string } | null;
  }> {
    const result = await this.execute();
    if (result.error) {
      return { data: null, error: result.error };
    }

    const rows = Array.isArray(result.data)
      ? result.data
      : result.data
        ? [result.data]
        : [];

    if (rows.length === 0) {
      return { data: null, error: null };
    }
    if (rows.length > 1) {
      return { data: null, error: { message: "Multiple rows found" } };
    }
    return { data: rows[0], error: null };
  }

  async execute(): Promise<{
    data: Row | Row[] | null;
    error: { message: string; code?: string } | null;
  }> {
    const tableRows = this.store[this.table] as Row[];

    if (this.mode === "insert") {
      const payloads = Array.isArray(this.insertPayload)
        ? this.insertPayload
        : [this.insertPayload as Row];

      for (const payload of payloads) {
        const conflict = this.assertUniqueActiveJogatina(payload);
        if (conflict) {
          return { data: null, error: conflict };
        }
      }

      const inserted = payloads.map((payload) => {
        const row: Row = {
          id: nextId(String(this.table)),
          ...payload,
        };
        tableRows.push(row);
        return this.pickColumns(row);
      });

      return {
        data: inserted.length === 1 ? inserted[0] : inserted,
        error: null,
      };
    }

    if (this.mode === "update") {
      const matching = this.applyFilters(tableRows);
      for (const row of matching) {
        Object.assign(row, this.updatePayload);
      }
      return { data: matching.map((r) => this.pickColumns(r)), error: null };
    }

    const filtered = this.applyFilters(tableRows);
    const projected = filtered.map((row) => this.pickColumns(row));
    return { data: projected, error: null };
  }

  then<TResult1 = { data: Row | Row[] | null; error: { message: string; code?: string } | null }, TResult2 = never>(
    onfulfilled?: (
      value: { data: Row | Row[] | null; error: { message: string; code?: string } | null },
    ) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createJoinTestSupabase(store: JoinTestStore) {
  return {
    from(table: keyof JoinTestStore) {
      return new QueryBuilder(store, table);
    },
    _store: store,
  };
}

export type JoinTestSupabase = ReturnType<typeof createJoinTestSupabase>;
