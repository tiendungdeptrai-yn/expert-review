"use client";
import { useState, useEffect } from "react";

function Logo({ className = "h-11 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 50" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="erGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <rect x="0" y="4" width="42" height="42" rx="11" fill="url(#erGrad)" />
      <path d="M12 18 L30 18 L30 22 L16 22 L16 24 L28 24 L28 28 L16 28 L16 30 L30 30 L30 34 L12 34 Z" fill="#fff" />
      <circle cx="33" cy="20" r="3" fill="#fbbf24" />
      <text x="52" y="27" fill="#1e293b" fontSize="17" fontWeight="800" fontFamily="system-ui">EXPERT</text>
      <text x="52" y="43" fill="#dc2626" fontSize="17" fontWeight="800" fontFamily="system-ui">REVIEW</text>
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "#dich-vu", label: "Dịch vụ" },
    { href: "#quy-trinh", label: "Quy trình" },
    { href: "#cam-ket", label: "Cam kết" },
    { href: "#danh-gia", label: "Đánh giá" },
    { href: "#faq", label: "FAQ" },
    { href: "#lien-he", label: "Liên hệ" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition ${scrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-transparent"}`}>
      <div className="container-x flex h-20 items-center justify-between">
        <a href="#top"><Logo /></a>
        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="font-medium text-slate-700 hover:text-red-600">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="tel:0564987979" className="hidden sm:inline-flex btn-primary !px-5 !py-2.5 text-sm">📞 0564.987.979</a>
          <button onClick={() => setOpen(!open)} className="lg:hidden rounded-lg p-2 text-slate-700 text-2xl">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="container-x flex flex-col py-4">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-3 font-medium text-slate-700">
                {n.label}
              </a>
            ))}
            <a href="tel:0564987979" className="btn-primary mt-3">📞 Gọi ngay 0564.987.979</a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const stats = [
    { n: "500+", l: "Khách hàng" },
    { n: "98%", l: "Thành công" },
    { n: "24/24", l: "Hỗ trợ" },
    { n: "30", l: "Ngày BH" },
  ];

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-white pt-32 pb-20">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl" />

      <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700">
            ⭐ Dịch vụ uy tín #1 cho doanh nghiệp
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Xóa Review Tiêu Cực —
            <span className="block bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Bảo Vệ Uy Tín Doanh Nghiệp
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Chuyên <strong>xóa đánh giá tiêu cực</strong>, <strong>seeding review 5 sao</strong> và <strong>tăng đánh giá Google Maps</strong>.
            Xử lý nhanh <strong>1–2 ngày</strong>, <strong>thanh toán sau khi hoàn thành</strong>, bảo hành <strong>30 ngày</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="tel:0564987979" className="btn-primary">📞 Gọi ngay: 0564.987.979</a>
            <a href="https://zalo.me/0564987979" target="_blank" rel="noopener" className="btn-outline">💬 Chat Zalo</a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-200 bg-white/60 p-4 text-center backdrop-blur">
                <div className="text-2xl font-extrabold text-red-600">{s.n}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-6 text-white">
              <div className="text-sm font-semibold opacity-90">🎯 Kết quả thực tế</div>
              <div className="mt-2 text-3xl font-extrabold">+1.200 đánh giá 5★</div>
              <div className="mt-1 text-sm opacity-90">cho khách hàng chỉ trong 7 ngày</div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { t: "Xóa review tiêu cực", s: "1–2 ngày" },
                { t: "Seeding review 5 sao", s: "2–4 ngày" },
                { t: "Tăng đánh giá Google Maps", s: "3–7 ngày" },
              ].map((r) => (
                <div key={r.t} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-white">✓</span>
                    <span className="font-semibold">{r.t}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{r.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function Services() {
  const services = [
    { icon: "🛡️", title: "Xóa Review Tiêu Cực", desc: "Xóa đánh giá 1 sao, bình luận bôi nhọ, tin đồn sai sự thật trên Google Maps, Facebook, Shopee…", points: ["Xóa 100% đánh giá xấu", "Đúng chính sách Google", "Bảo hành 30 ngày"] },
    { icon: "⭐", title: "Seeding Review 5 Sao", desc: "Tạo đánh giá 5 sao chất lượng cao từ tài khoản thật, nội dung đa dạng, tự nhiên như khách thật.", points: ["Tài khoản thật – IP Việt", "Nội dung độc nhất", "Tăng dần theo lộ trình"] },
    { icon: "📍", title: "Tăng Đánh Giá Google Maps", desc: "Đẩy số lượng + chất lượng review cho cửa hàng, quán ăn, spa, khách sạn để tăng thứ hạng tìm kiếm.", points: ["Tăng top Google Maps", "Tăng lượt gọi & ghé", "Báo cáo minh bạch"] },
  ];

  return (
    <section id="dich-vu" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-red-600">Dịch vụ</span>
          <h2 className="section-title mt-3">Giải Pháp Uy Tín Cho Doanh Nghiệp</h2>
          <p className="mt-4 text-slate-600">Chúng tôi giúp bạn kiểm soát hình ảnh thương hiệu trên Google, Facebook và các nền tảng đánh giá.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="card">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-red-50 text-3xl">{s.icon}</div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.desc}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="text-red-600">✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", t: "Liên hệ & Tư vấn", d: "Gọi điện hoặc chat Zalo. Chúng tôi kiểm tra tình trạng thực tế và tư vấn miễn phí." },
    { n: "02", t: "Báo giá & Xác nhận", d: "Nhận báo giá rõ ràng. Không phát sinh. Xác nhận yêu cầu và bắt đầu triển khai." },
    { n: "03", t: "Xử lý 1–2 ngày", d: "Đội ngũ triển khai nhanh chóng, đúng chuẩn chính sách nền tảng, bảo mật tuyệt đối." },
    { n: "04", t: "Nghiệm thu & Thanh toán", d: "Kiểm tra kết quả. Hài lòng mới thanh toán. Bảo hành 30 ngày sau đó." },
  ];

  return (
    <section id="quy-trinh" className="bg-slate-50 py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-red-600">Quy trình</span>
          <h2 className="section-title mt-3">Chỉ 4 Bước Đơn Giản</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-5xl font-extrabold text-red-100">{s.n}</div>
              <h3 className="mt-3 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Guarantees() {
  const items = [
    { icon: "💰", t: "Thanh toán sau", d: "Làm xong mới trả tiền. Không thành công không thu phí." },
    { icon: "🛡️", t: "Bảo hành 30 ngày", d: "Review quay lại? Chúng tôi xử lý miễn phí trong 30 ngày." },
    { icon: "⏰", t: "Hỗ trợ 24/24", d: "Tư vấn và hỗ trợ mọi lúc, kể cả cuối tuần và lễ." },
    { icon: "🔒", t: "Bảo mật tuyệt đối", d: "Không tiết lộ thông tin khách hàng cho bất kỳ ai." },
    { icon: "⚡", t: "Xử lý cực nhanh", d: "Chỉ 1–2 ngày cho hầu hết các dịch vụ xóa review." },
    { icon: "🎯", t: "Cam kết 100%", d: "Hoàn thành đúng thỏa thuận, sai hoàn tiền 200%." },
  ];

  return (
    <section id="cam-ket" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-red-600">Cam kết</span>
          <h2 className="section-title mt-3">Vì Sao Khách Hàng Tin Chọn Expert Review?</h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.t} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-600 text-2xl text-white">{i.icon}</div>
              <div>
                <h3 className="font-bold">{i.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{i.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "Anh Minh", role: "Chủ quán ăn – Q.1", text: "Bị 12 review 1 sao phá hoại. Expert Review xóa sạch trong 1 ngày. Quá uy tín, giá hợp lý." },
    { name: "Chị Hương", role: "Spa – Thủ Đức", text: "Seeding 300 review 5 sao, tự nhiên, không bị Google gỡ. Khách đến đông hơn hẳn." },
    { name: "Anh Tuấn", role: "Khách sạn – Vũng Tàu", text: "Thanh toán sau khi xong. Làm đúng cam kết, bảo hành chu đáo. Đánh giá 5 sao!" },
  ];

  return (
    <section id="danh-gia" className="bg-slate-50 py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-red-600">Đánh giá</span>
          <h2 className="section-title mt-3">Khách Hàng Nói Gì Về Chúng Tôi</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="card">
              <div className="text-yellow-500 text-xl">★★★★★</div>
              <p className="mt-4 italic text-slate-700">"{r.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-red-600 font-bold text-white">{r.name.charAt(0)}</div>
                <div>
                  <div className="font-bold">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function FAQ() {
  const faqs = [
    { q: "Xóa review tiêu cực có vi phạm chính sách Google không?", a: "Không. Chúng tôi chỉ xóa các đánh giá vi phạm chính sách của Google (spam, bôi nhọ, sai sự thật, tài khoản ảo). Đây là quyền chính đáng của doanh nghiệp." },
    { q: "Thời gian xử lý mất bao lâu?", a: "Thông thường 1–2 ngày cho xóa review, 2–4 ngày cho seeding. Trường hợp phức tạp có thể lâu hơn, sẽ báo trước." },
    { q: "Thanh toán như thế nào?", a: "Thanh toán SAU KHI hoàn thành và bạn nghiệm thu. Không cọc, không thành công không thu phí." },
    { q: "Có bảo hành không?", a: "Có. Bảo hành 30 ngày. Nếu review quay lại trong thời gian này, chúng tôi xử lý miễn phí." },
    { q: "Thông tin của tôi có được bảo mật?", a: "Tuyệt đối. Chúng tôi không chia sẻ thông tin khách hàng cho bên thứ ba." },
    { q: "Làm sao để bắt đầu?", a: "Gọi 0564.987.979 hoặc chat Zalo. Chúng tôi kiểm tra miễn phí và báo giá trong 5 phút." },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="container-x max-w-4xl">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-red-600">FAQ</span>
          <h2 className="section-title mt-3">Câu Hỏi Thường Gặp</h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-md">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                {f.q}
                <span className="ml-4 text-red-600 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", service: "Xóa review tiêu cực", note: "" });

  const sendZalo = () => {
    const msg = `Xin chào Expert Review,%0A%0ATôi là: ${form.name}%0ASĐT: ${form.phone}%0ADịch vụ: ${form.service}%0AGhi chú: ${form.note}`;
    window.open(`https://zalo.me/0564987979?text=${msg}`, "_blank");
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`Yêu cầu dịch vụ: ${form.service}`);
    const body = encodeURIComponent(`Tên: ${form.name}\nSĐT: ${form.phone}\nDịch vụ: ${form.service}\nGhi chú: ${form.note}`);
    window.location.href = `mailto:phamhoangtiendung.tb@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="lien-he" className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-800 py-20 lg:py-28 text-white">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-yellow-500/30 blur-3xl" />
      <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">Liên hệ</span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Cần Xử Lý Ngay? Gọi Cho Chúng Tôi!</h2>
          <p className="mt-4 text-white/90">Tư vấn miễn phí – Báo giá trong 5 phút – Hỗ trợ 24/24.</p>
          <div className="mt-8 space-y-4">
            <a href="tel:0564987979" className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/20">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl text-red-700">📞</span>
              <div>
                <div className="text-sm text-white/70">Hotline / Zalo</div>
                <div className="text-lg font-bold">0564.987.979</div>
              </div>
            </a>
            <a href="mailto:phamhoangtiendung.tb@gmail.com" className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/20">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl text-red-700">✉️</span>
              <div>
                <div className="text-sm text-white/70">Email</div>
                <div className="text-base font-bold break-all">phamhoangtiendung.tb@gmail.com</div>
              </div>
            </a>
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl text-red-700">📍</span>
              <div>
                <div className="text-sm text-white/70">Địa chỉ</div>
                <div className="text-lg font-bold">Thủ Đức, TP.HCM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-2xl sm:p-8">
          <h3 className="text-2xl font-extrabold">Gửi Yêu Cầu Nhanh</h3>
          <p className="mt-1 text-sm text-slate-500">Điền thông tin, chúng tôi liên hệ trong 5 phút.</p>
          <div className="mt-6 space-y-4">
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Họ và tên" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
            <input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="Số điện thoại / Zalo" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
            <select value={form.service} onChange={(e)=>setForm({...form, service:e.target.value})} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100">
              <option>Xóa review tiêu cực</option>
              <option>Seeding review 5 sao</option>
              <option>Tăng đánh giá Google Maps</option>
              <option>Combo nhiều dịch vụ</option>
            </select>
            <textarea value={form.note} onChange={(e)=>setForm({...form, note:e.target.value})} placeholder="Ghi chú (link Google Maps, số review cần xử lý…)" rows={3} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={sendZalo} className="btn-primary w-full">💬 Gửi qua Zalo</button>
              <button onClick={sendEmail} className="btn-outline w-full">✉️ Gửi Email</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-14">
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-slate-600">
            Expert Review – Dịch vụ xóa review tiêu cực, seeding 5 sao và tăng đánh giá Google Maps uy tín hàng đầu Việt Nam.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="https://www.facebook.com/dichvugooglemaps1012" target="_blank" rel="noopener" className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white font-bold transition hover:scale-110">f</a>
            <a href="https://www.tiktok.com/@newfuturegooglemaps" target="_blank" rel="noopener" className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white transition hover:scale-110">♪</a>
            <a href="https://zalo.me/0564987979" target="_blank" rel="noopener" className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white font-bold transition hover:scale-110">Z</a>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Dịch vụ</h4>
          <ul className="mt-4 space-y-2 text-slate-600">
            <li><a href="#dich-vu" className="hover:text-red-600">Xóa review tiêu cực</a></li>
            <li><a href="#dich-vu" className="hover:text-red-600">Seeding review 5 sao</a></li>
            <li><a href="#dich-vu" className="hover:text-red-600">Tăng đánh giá Google Maps</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold">Liên hệ</h4>
          <ul className="mt-4 space-y-2 text-slate-600">
            <li>📞 <a href="tel:0564987979" className="hover:text-red-600">0564.987.979</a></li>
            <li>✉️ <a href="mailto:phamhoangtiendung.tb@gmail.com" className="hover:text-red-600 break-all">phamhoangtiendung.tb@gmail.com</a></li>
            <li>📍 Thủ Đức, TP.HCM</li>
            <li>⏰ Hỗ trợ 24/24</li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Expert Review. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}

function FloatingButtons() {
  return (
    <>
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 sm:right-6">
        <a href="https://zalo.me/0564987979" target="_blank" rel="noopener" aria-label="Chat Zalo" className="grid h-14 w-14 place-items-center rounded-full bg-sky-500 text-2xl text-white shadow-xl ring-4 ring-white transition hover:scale-110">💬</a>
        <a href="tel:0564987979" aria-label="Gọi ngay" className="grid h-14 w-14 place-items-center rounded-full bg-red-600 text-2xl text-white shadow-xl ring-4 ring-white transition hover:scale-110 animate-pulse">📞</a>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden">
        <a href="tel:0564987979" className="flex-1 bg-red-600 py-3 text-center font-bold text-white">📞 Gọi ngay</a>
        <a href="https://zalo.me/0564987979" target="_blank" rel="noopener" className="flex-1 bg-sky-500 py-3 text-center font-bold text-white">💬 Chat Zalo</a>
      </div>
      <div className="h-16 sm:hidden" />
    </>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Process />
        <Guarantees />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}