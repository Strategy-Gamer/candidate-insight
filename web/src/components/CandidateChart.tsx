"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart, TooltipProps } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type ChartData = {
  position: string,
  proportion: number,
  amount: number,
  fill?: string
};

interface ChartProps {
  data: ChartData[],
  config: any
  party: string,
  description: string
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]; 

    return (
      <div className="bg-white shadow-md rounded-md p-2 border border-gray-300">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.payload.position === "Democratic" ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))" }} 
          />
          <p className="font-semibold">{data.payload.position} Candidates: {data.payload.amount}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Component(props: ChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{props.party}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={props.config as ChartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie data={props.data} dataKey="proportion">
              <LabelList 
                dataKey="position" 
                className="fill-background" 
                stroke="none" 
                fontSize={12} 
                formatter={(value: keyof typeof props.config) => props.config[value]?.label} 
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          {props.description}
        </div>
      </CardFooter>
    </Card>
  )
}
