"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: { id: string; name: string };
  _count: { comments: number };
}

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "general", label: "자유게시판" },
  { value: "race-review", label: "대회 후기" },
  { value: "training", label: "훈련 일지" },
  { value: "question", label: "질문/답변" },
];

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "방금 전";
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString("ko-KR");
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  return (
    <div>
      {/* Hero section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-2">함께 달리는 즐거움</h1>
        <p className="text-orange-100 text-sm">
          마라톤 경험을 나누고, 기록을 관리하고, 함께 성장하세요.
        </p>
      </div>

      {/* Category tabs + Write button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                category === cat.value
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {session && (
          <Link
            href="/posts/new"
            className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 whitespace-nowrap ml-4"
          >
            글쓰기
          </Link>
        )}
      </div>

      {/* Post list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">아직 게시글이 없습니다.</p>
          {session ? (
            <Link
              href="/posts/new"
              className="text-orange-600 hover:underline text-sm"
            >
              첫 번째 글을 작성해보세요
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-orange-600 hover:underline text-sm"
            >
              로그인하고 첫 번째 글을 작성해보세요
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                  {getCategoryLabel(post.category)}
                </span>
              </div>
              <h2 className="font-medium text-gray-900 mb-1">{post.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                {post.content}
              </p>
              <div className="flex items-center text-xs text-gray-400 gap-3">
                <span>{post.author.name}</span>
                <span>{formatDate(post.createdAt)}</span>
                <span>댓글 {post._count.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
