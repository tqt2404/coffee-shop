import { motion } from 'motion/react';
import { SILK_EASE } from '../../utils/motion';

export function Footer() {
  return (
    <footer className="bg-[#191715] text-[#EFECE6] overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 relative">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.55, ease: SILK_EASE }}
            className="md:col-span-5"
          >
            <p className="font-display text-2xl font-semibold text-[#F8F7F4]">
              Nhà Rang Lạc Sơn
            </p>
            <p className="mt-3 text-sm text-[#C7C1B6] leading-relaxed max-w-sm">
              Cà phê đặc sản rang thủ công mẻ nhỏ từ cao nguyên Đà Lạt và các vùng trồng
              tuyển chọn. Đóng gói nguyên bản, giao hàng toàn quốc.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08, ease: SILK_EASE }}
            className="md:col-span-4 text-sm space-y-2"
          >
            <p className="text-xs text-[#9E978B] mb-2">Hệ thống không gian</p>
            <p className="text-[#F8F7F4]">
              Đà Lạt: 18 Trần Hưng Đạo, P.10, TP. Đà Lạt
            </p>
            <p className="text-[#F8F7F4]">
              Hà Nội: 42 Hàng Bông, Q. Hoàn Kiếm, Hà Nội
            </p>
            <p className="text-[#C7C1B6] font-mono text-xs pt-1">
              Hotline: 0263 382 4190 · 07:30 – 21:30
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.16, ease: SILK_EASE }}
            className="md:col-span-3 text-sm space-y-2"
          >
            <p className="text-xs text-[#9E978B] mb-2">Chính sách khách hàng</p>
            <ul className="space-y-1.5 text-[#C7C1B6]">
              <li>Miễn phí giao hàng đơn từ 500.000 ₫</li>
              <li>Đổi trả trong 7 ngày nếu lỗi bao bì</li>
              <li>Thanh toán COD &amp; Chuyển khoản</li>
            </ul>
          </motion.div>

          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, ease: SILK_EASE }}
            style={{ transformOrigin: '0% 50%' }}
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#34302B]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.12, ease: SILK_EASE }}
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#9E978B]"
        >
          <p>© 2026 Nhà Rang Lạc Sơn. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <a href="#bo-suu-tap" className="hover:text-[#F8F7F4] transition-colors">
              Bộ sưu tập
            </a>
            <a href="#triet-ly-rang" className="hover:text-[#F8F7F4] transition-colors">
              Triết lý rang
            </a>
            <a href="#cua-hang" className="hover:text-[#F8F7F4] transition-colors">
              Cửa hàng &amp; Chỉ đường
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
