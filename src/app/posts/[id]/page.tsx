"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: { id: string; name: string };
  comments: Comment[];
}

const CATEGORY_MAP: Record<string, string> = {
  general: "자유게시판",
  "race-review": "대회 후기",
  training: "훈련 일지",
  question: "질문/답변",
};

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setPost((prev) =>
          prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
        );
        setComment("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">로딩 중...</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">게시글을 찾을 수 없습니다.</p>
        <Link href="/" className="text-orange-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Post */}
      <article className="bg-white rounded-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
            {CATEGORY_MAP[post.category] || post.category}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>

        <div className="flex items-center text-sm text-gray-400 mb-4 gap-3">
          <span className="font-medium text-gray-600">{post.author.name}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {session?.user?.id === post.author.id && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              삭제
            </button>
          </div>
        )}
      </article>

      {/* Comments */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">
          댓글 {post.comments.length}
        </h2>

        {post.comments.length > 0 && (
          <div className="space-y-3 mb-6">
            {post.comments.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-lg p-4 border border-gray-100"
              >
                <div className="flex items-center text-xs text-gray-400 gap-2 mb-2">
                  <span className="font-medium text-gray-600">
                    {c.author.name}
                  </span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {session ? (
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
            >
              작성
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400">
            <Link href="/login" className="text-orange-600 hover:underline">
              로그인
            </Link>
            하고 댓글을 남겨보세요.
          </p>
        )}
      </section>

      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; 목록으로
        </Link>
      </div>
    </div>
  );
}
