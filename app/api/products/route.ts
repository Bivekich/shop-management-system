import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export async function GET() {
    try {
        const response = await prisma.product.findMany()
        return NextResponse.json(response)
    } catch (error) {
        return NextResponse.json({error: `Ошибка при получении товаров: ${error}`}, {status: 500})
    }
}

export async function POST(request: Request) {
    try {
        const {name, price} = await request.json()
        const product = await prisma.product.create({
            data: {
                name,
                price
            }
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({error: `Ошибка при создании товара: ${error}`}, {status: 500})
    }
}