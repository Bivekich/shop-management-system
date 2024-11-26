import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                discount: true,
            },
        })
        return NextResponse.json(orders)
    } catch (err) {
        console.error("Error fetching orders:", err);
        return NextResponse.json({ error: "Не удалось получить заказы" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { customerName, deliveryAddress, orderItems, discountCode } = await request.json()

        // Find the discount if a code is provided
        let discount = null
        if (discountCode) {
            discount = await prisma.discount.findFirst({
                where: {
                    code: discountCode,
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
            })
        }

        const order = await prisma.order.create({
            data: {
                customerName,
                deliveryAddress,
                orderItems: {
                    create: orderItems.map((item: { productId: number; quantity: number }) => ({
                        quantity: item.quantity,
                        product: {
                            connect: { id: item.productId },
                        },
                    })),
                },
                discount: discount ? { connect: { id: discount.id } } : undefined,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                discount: true,
            },
        })

        return NextResponse.json(order)
    } catch (err) {
        console.error("Error creating order:", err);
        return NextResponse.json({ error: "Не удалось создать заказ" }, { status: 500 })
    }
}

