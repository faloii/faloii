import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    const records = await prisma.raceRecord.findMany({
      where: { userId },
      orderBy: { raceDate: "desc" },
    });

    return NextResponse.json(records);
  } catch {
    return NextResponse.json(
      { error: "기록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { raceName, raceDate, distance, finishTime, memo } =
      await request.json();

    if (!raceName || !raceDate || !distance || !finishTime) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const record = await prisma.raceRecord.create({
      data: {
        raceName,
        raceDate: new Date(raceDate),
        distance,
        finishTime,
        memo,
        userId: session.user.id,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "기록 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
