import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Gamepad2, Calendar, TrendingUp, TrendingDown, Target, Award } from "lucide-react"

interface StatsCardsProps {
  totalPlayers: number
  totalGames: number
  totalJogatinas: number
  totalParticipations: number
  dropRate: string
  dropCount: number
  zeroCount: number
  davaCount: number
}

export function StatsCards({
  totalPlayers,
  totalGames,
  totalJogatinas,
  totalParticipations,
  dropRate,
  dropCount,
  zeroCount,
  davaCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Jogadores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalPlayers}</div>
          <p className="text-xs text-muted-foreground mt-1">Perfis cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Jogos</CardTitle>
          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalGames}</div>
          <p className="text-xs text-muted-foreground mt-1">Jogos cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Jogatinas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalJogatinas}</div>
          <p className="text-xs text-muted-foreground mt-1">Sessões registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Participações</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalParticipations}</div>
          <p className="text-xs text-muted-foreground mt-1">Total de participações</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Drop</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">{dropRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">{dropCount} drops registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Zerados</CardTitle>
          <Award className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">{zeroCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Jogos completados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Dava pra Jogar</CardTitle>
          <Target className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-500">{davaCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Poderiam continuar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Média por Jogatina</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalJogatinas > 0 ? (totalParticipations / totalJogatinas).toFixed(1) : "0"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Jogadores por sessão</p>
        </CardContent>
      </Card>
    </div>
  )
}
