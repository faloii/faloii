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
  memo: string | null;
  createdAt: string;
}

const DISTANCES = [
  "5K",
  "10K",
  "하프마라톤",
  "풀마라톤",
  "울트라마라톤",
  "기타",
];

export default function RecordsPage() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<RaceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [raceName, setRaceName] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [distance, setDistance] = useState("풀마라톤");
  const [finishTime, setFinishTime] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raceName, raceDate, distance, finishTime, memo }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setSubmitting(false);
        return;
      }

      const newRecord = await res.json();
      setRecords([newRecord, ...records]);
      setShowForm(false);
      setRaceName("");
      setRaceDate("");
      setDistance("풀마라톤");
      setFinishTime("");
      setMemo("");
    } catch {
      setError("기록 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">내 마라톤 기록</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700"
        >
          {showForm ? "취소" : "기록 추가"}
        </button>
      </div>

      {/* Add record form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-6 border border-gray-100 mb-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대회명
            </label>
            <input
              type="text"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="예: 2025 서울마라톤"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대회 일자
              </label>
              <input
                type="date"
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거리
              </label>
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {DISTANCES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              완주 시간
            </label>
            <input
              type="text"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="예: 3:45:30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y"
              placeholder="대회 소감, 컨디션 등"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "기록 등록"}
          </button>
        </form>
      )}

      {/* Records list */}
      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">아직 등록된 기록이 없습니다.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-orange-600 hover:underline text-sm"
          >
            첫 번째 기록을 추가해보세요
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg p-5 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {record.raceName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                    <span>
                      {new Date(record.raceDate).toLocaleDateString("ko-KR")}
                    </span>
                    <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                      {record.distance}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">
                    {record.finishTime}
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-xs text-gray-400 hover:text-red-500 mt-1"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {record.memo && (
                <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-50">
                  {record.memo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
