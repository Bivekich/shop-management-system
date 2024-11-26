'use client'

import * as React from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import { Bar, Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
)

type AnalyticsData = {
    salesTrend: {
        labels: string[]
        data: number[]
    }
    popularProducts: {
        labels: string[]
        data: number[]
    }
    activityPeriods: {
        labels: string[]
        data: number[]
    }
}

export default function SalesAnalytics() {
    const [timeRange, setTimeRange] = useState('week')

    const { data, isLoading, error } = useQuery<AnalyticsData>({
        queryKey: ['analytics', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/analytics?timeRange=${timeRange}`)
            if (!response.ok) {
                throw new Error("Не удалось загрузить данные аналитики")
            }
            return response.json()
        }
    })

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />
    if (error) return <div>Ошибка при загрузке данных аналитики</div>
    if (!data) return null

    const chartColors = [
        'hsl(var(--primary))',
        'hsl(var(--secondary))',
        'hsl(var(--accent))',
        'hsl(var(--muted))',
        'hsl(var(--card))',
    ]

    const salesTrendOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'hsl(var(--foreground))',
                },
            },
            title: {
                display: true,
                text: 'Тренд продаж',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'hsl(var(--border) / 0.2)',
                },
            },
            x: {
                grid: {
                    color: 'hsl(var(--border) / 0.2)',
                },
            },
        },
    }

    const salesTrendData = {
        labels: data.salesTrend.labels,
        datasets: [
            {
                label: 'Продажи',
                data: data.salesTrend.data,
                borderColor: chartColors[0],
                backgroundColor: `${chartColors[0]}20`,
                tension: 0.1,
            },
        ],
    }

    const popularProductsOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'hsl(var(--foreground))',
                },
            },
            title: {
                display: true,
                text: 'Популярные товары',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'hsl(var(--border) / 0.2)',
                },
            },
            x: {
                grid: {
                    color: 'hsl(var(--border) / 0.2)',
                },
            },
        },
    }

    const popularProductsData = {
        labels: data.popularProducts.labels,
        datasets: [
            {
                label: 'Количество продаж',
                data: data.popularProducts.data,
                backgroundColor: chartColors.map(color => `${color}80`),
            },
        ],
    }

    const activityPeriodsOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'hsl(var(--foreground))',
                },
            },
            title: {
                display: true,
                text: 'Периоды активности',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'hsl(var(--border) / 0.2)',
                },
            },
            x: {
                grid: {
                    color: 'hsl(var(--border) / 0.2)',
                },
            },
        },
    }

    const activityPeriodsData = {
        labels: data.activityPeriods.labels,
        datasets: [
            {
                label: 'Количество заказов',
                data: data.activityPeriods.data,
                backgroundColor: `${chartColors[2]}40`,
                borderColor: chartColors[2],
                borderWidth: 1,
            },
        ],
    }

    return (
        <div className="space-y-4">
            <Tabs value={timeRange} onValueChange={setTimeRange}>
                <TabsList>
                    <TabsTrigger value="week">Неделя</TabsTrigger>
                    <TabsTrigger value="month">Месяц</TabsTrigger>
                    <TabsTrigger value="year">Год</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Тренд продаж</CardTitle>
                        <CardDescription>Динамика продаж за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                sales: {
                                    label: "Продажи",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                            className="h-[300px]"
                        >
                            <React.Fragment>
                                <Line options={salesTrendOptions} data={salesTrendData} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </React.Fragment>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Популярные товары</CardTitle>
                        <CardDescription>Топ-5 самых продаваемых товаров</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                sales: {
                                    label: "Количество продаж",
                                    color: "hsl(var(--chart-2))",
                                },
                            }}
                            className="h-[300px]"
                        >
                            <React.Fragment>
                                <Bar options={popularProductsOptions} data={popularProductsData} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </React.Fragment>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Периоды активности</CardTitle>
                        <CardDescription>Распределение заказов по времени суток</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                orders: {
                                    label: "Количество заказов",
                                    color: "hsl(var(--chart-3))",
                                },
                            }}
                            className="h-[300px]"
                        >
                            <React.Fragment>
                                <Bar options={activityPeriodsOptions} data={activityPeriodsData} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </React.Fragment>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

