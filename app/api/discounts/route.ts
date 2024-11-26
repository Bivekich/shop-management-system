import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
    try {
        const discounts = await prisma.discount.findMany()
        return NextResponse.json(discounts)
    } catch {
        return NextResponse.json({ error: "Не удалось получить скидки" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const discount = await prisma.discount.create({
            data: {
                name: data.name,
                type: data.type,
                value: data.value,
                code: data.code,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            },
        })
        return NextResponse.json(discount)
    } catch {
        return NextResponse.json({ error: "Не удалось создать скидку" }, { status: 500 })
    }
}

