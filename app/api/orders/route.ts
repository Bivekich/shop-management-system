import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({error: `Ошибка при получении заказов: ${error}`}, {status: 500})
    }
}

export async function POST(request: Request) {
    try {
        const {customerName, deliveryAddress, orderItems} = await request.json()
        const order = await prisma.order.create({
            data: {
                customerName,
                deliveryAddress,
                orderItems: {
                    create: orderItems.map((item: {productId: number; quantity: number}) => ({
                        quantity: item.quantity,
                        product: {
                            connect: {id: item.productId}
                        }
                    }))
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        })
        return NextResponse.json(order)
    } catch (error) {
        return NextResponse.json({error: `Ошибка при создании заказа: ${error}`}, {status: 500})
    }
}