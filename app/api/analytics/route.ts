import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'week'

    try {
        const startDate = getStartDate(timeRange)

        // Получаем данные о продажах
        const salesData = await prisma.order.groupBy({
            by: ['orderDate'],
            _sum: {
                id: true, // Используем id как прокси для количества заказов
            },
            where: {
                orderDate: {
                    gte: startDate,
                },
            },
            orderBy: {
                orderDate: 'asc',
            },
        })

        // Получаем популярные товары
        const popularProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 5,
        })

        // Получаем периоды активности
        const activityPeriods = await prisma.order.groupBy({
            by: ['orderDate'],
            _count: {
                id: true,
            },
            where: {
                orderDate: {
                    gte: startDate,
                },
            },
        })

        // Форматируем данные для фронтенда
        const salesTrend = {
            labels: salesData.map(item => new Date(item.orderDate).toLocaleDateString()),
            data: salesData.map(item => item._sum.id || 0),
        }

        const popularProductsData = await Promise.all(
            popularProducts.map(async item => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                })
                return {
                    name: product?.name || 'Unknown',
                    sales: item._sum.quantity || 0,
                }
            })
        )

        const activityPeriodsFormatted = activityPeriods.reduce((acc, item) => {
            const hour = new Date(item.orderDate).getHours()
            acc[hour] = (acc[hour] || 0) + item._count.id
            return acc
        }, {} as Record<number, number>)

        return NextResponse.json({
            salesTrend,
            popularProducts: {
                labels: popularProductsData.map(item => item.name),
                data: popularProductsData.map(item => item.sales),
            },
            activityPeriods: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                data: Array.from({ length: 24 }, (_, i) => activityPeriodsFormatted[i] || 0),
            },
        })
    } catch (error) {
        console.error('Error fetching analytics data:', error)
        return NextResponse.json({ error: "Не удалось получить данные аналитики" }, { status: 500 })
    }
}

function getStartDate(timeRange: string): Date {
    const now = new Date()
    switch (timeRange) {
        case 'week':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        case 'month':
            return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        case 'year':
            return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        default:
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    }
}

