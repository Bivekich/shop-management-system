import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/api"

export async function GET() {
    try {
        const data = await getDashboardData()
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: "Не удалось получить данные панели управления" }, { status: 500 })
    }
}

