"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RaceRecord {
  id: string;
  raceName: string;
  raceDate: string;
  distance: string;
  finishTime: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<RaceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/records")
        .then((res) => res.json())
        .then((data) => {
          setRecords(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="text-center py-12 text-gray-400">로딩 중...</div>;
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
        <Link href="/login" className="text-orange-600 hover:underline">
          로그인하기
        </Link>
      </div>
    );
  }

  const totalRaces = records.length;
  const distanceCounts: Record<string, number> = {};
  records.forEach((r) => {
    distanceCounts[r.distance] = (distanceCounts[r.distance] || 0) + 1;
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-lg p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-orange-600">
              {session.user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {session.user.name}
            </h1>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-600">{totalRaces}</div>
          <div className="text-xs text-gray-500 mt-1">완주 대회</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {distanceCounts["풀마라톤"] || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">풀마라톤</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {distanceCounts["하프마라톤"] || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">하프마라톤</div>
        </div>
      </div>

      {/* Recent records */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm">최근 대회 기록</h2>
          <Link href="/records" className="text-orange-600 text-xs hover:underline">
            전체보기
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-2">아직 기록이 없습니다.</p>
            <Link
              href="/records"
              className="text-orange-600 hover:underline text-sm"
            >
              첫 기록을 추가해보세요
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.slice(0, 5).map((record) => (
              <div key={record.id} className="flex justify-between items-center p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {record.raceName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(record.raceDate).toLocaleDateString("ko-KR")} ·{" "}
                    {record.distance}
                  </p>
                </div>
                <span className="text-sm font-bold text-orange-600">
                  {record.finishTime}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
