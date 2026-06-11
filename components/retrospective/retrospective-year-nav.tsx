"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RetrospectiveYearNavProps {
  year: number;
  availableYears: number[];
}

export function RetrospectiveYearNav({
  year,
  availableYears,
}: RetrospectiveYearNavProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const sortedYears = [...availableYears].sort((a, b) => b - a);
  const yearIndex = sortedYears.indexOf(year);
  const previousYear = yearIndex < sortedYears.length - 1 ? sortedYears[yearIndex + 1] : null;
  const nextYear = yearIndex > 0 ? sortedYears[yearIndex - 1] : null;

  function navigateToYear(targetYear: number) {
    router.push(`/dashboard/retrospectiva?year=${targetYear}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="relative">
        <div className="absolute top-0 left-0 h-px w-12 bg-primary/40" />
        <div className="absolute top-0 left-0 h-12 w-px bg-primary/40" />
        <h1 className="text-4xl font-bold text-balance md:text-5xl">
          Retrospectiva {year}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-balance">
          O que o grupo jogou ao longo do ano
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={!previousYear}
          onClick={() => previousYear && navigateToYear(previousYear)}
          aria-label="Ano anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select
          value={String(year)}
          onValueChange={(value) => navigateToYear(Number.parseInt(value, 10))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortedYears.map((availableYear) => (
              <SelectItem
                key={availableYear}
                value={String(availableYear)}
                disabled={availableYear > currentYear}
              >
                {availableYear}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          disabled={!nextYear || (nextYear ?? 0) > currentYear}
          onClick={() => nextYear && navigateToYear(nextYear)}
          aria-label="Próximo ano"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {year !== currentYear && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/retrospectiva">Ano atual</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
