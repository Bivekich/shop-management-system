import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getDashboardData() {
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()

    // Fetch all order items with their associated products
    const orderItems = await prisma.orderItem.findMany({
        include: {
            product: true,
        },
    })

    // Calculate total revenue
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

    // Calculate popular products
    const productSales = orderItems.reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity
        return acc
    }, {} as Record<number, number>)

    const popularProducts = await Promise.all(
        Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(async ([productId, sales]) => {
                const product = await prisma.product.findUnique({
                    where: { id: Number(productId) },
                })
                return {
                    name: product?.name || 'Unknown',
                    sales,
                }
            })
    )

    return {
        totalProducts,
        totalOrders,
        totalRevenue,
        popularProducts,
    }
}

