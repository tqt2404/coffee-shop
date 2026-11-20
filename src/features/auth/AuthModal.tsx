import { useEffect, useState, type FormEvent } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BronzeCorners } from '../../components/motion/MorphStage';
import { SafeImage } from '../../components/ui/SafeImage';
import { useFirebase } from '../../lib/firebase/FirebaseProvider';
import { SILK_EASE } from '../../utils/motion';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

const AUTH_BRAND_IMAGE = '/src/assets/images/hero_coffee_atelier_1795140495466.jpg';

const MEMBER_PERKS = [
  'Theo dõi tiến trình rang mới & giao hàng theo từng mã mẻ',
  'Lưu lịch hẹn thử nếm tại phòng nếm Đà Lạt & Hà Nội',
  'Thanh toán nhanh và đồng bộ sổ đơn hàng trên mọi thiết bị',
];

export function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    authBusy,
    authError,
    clearAuthError,
    signInWithPassword,
    registerWithPassword,
    signInWithGoogle,
  } = useFirebase();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!authModalOpen) {
      setLocalError(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  }, [authModalOpen]);

  useEffect(() => {
    if (!authModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authModalOpen, closeAuthModal]);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setLocalError(null);
    setPassword('');
    setConfirmPassword('');
    clearAuthError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (mode === 'login') {
      if (!username.trim() || !password) {
        setLocalError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
        return;
      }
      await signInWithPassword(username.trim(), password, rememberMe);
      return;
    }

    if (displayName.trim().length < 2) {
      setLocalError('Vui lòng nhập họ và tên tối thiểu 2 ký tự.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username.trim())) {
      setLocalError(
        'Tên đăng nhập gồm 3–32 ký tự không dấu (chữ cái, số, dấu chấm hoặc gạch dưới).'
      );
      return;
    }
    if (password.length < 6) {
      setLocalError('Mật khẩu cần có tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận chưa trùng khớp.');
      return;
    }

    await registerWithPassword({
      username: username.trim().toLowerCase(),
      password,
      displayName: displayName.trim(),
    });
  };

  const activeError = localError || authError;
  const strength = evaluatePasswordStrength(password);

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Solid semi-transparent backdrop — zero gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-[#191715]/65"
          />

          {/* 2-Column Split Editorial Auth Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.24, ease: SILK_EASE }}
            className="relative z-10 w-full max-w-3xl bg-[#FFFFFF] border border-[#191715] max-h-[92vh] overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch"
          >
            <BronzeCorners size="sm" />

            {/* Left Column (42% / 5 cols): Heritage Brand Photography + Solid Ink Band */}
            <div className="hidden md:flex md:col-span-5 flex-col bg-[#191715] text-[#F8F7F4] border-r border-[#191715]">
              <div className="relative flex-1 min-h-[260px] overflow-hidden bg-[#262320]">
                <SafeImage
                  src={AUTH_BRAND_IMAGE}
                  alt="Không gian pha chế Pour-over tại Nhà Rang Lạc Sơn"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 bg-[#191715] border-t border-[#34302B] space-y-4">
                <div>
                  <p className="text-xs tracking-[0.08em] uppercase text-[#C9B38C]">
                    Nhà Rang Lạc Sơn
                  </p>
                  <p className="font-display text-2xl leading-snug text-[#F8F7F4] mt-1">
                    Hương vị nguyên bản từ cao nguyên Đà Lạt.
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-[#34302B] text-xs text-[#D5CFC4] leading-relaxed">
                  {MEMBER_PERKS.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check
                        className="w-3.5 h-3.5 text-[#C9B38C] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column (58% / 7 cols): Clean Standard Production Auth Form */}
            <div className="md:col-span-7 bg-[#FFFFFF] flex flex-col justify-between p-6 sm:p-8 md:max-h-[92vh] md:overflow-y-auto">
              <div>
                {/* Top Header & Close */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="auth-modal-title"
                      className="font-display text-3xl font-semibold text-[#191715] leading-tight"
                    >
                      {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                    </h2>
                    <p className="text-sm text-[#5C574F] mt-1">
                      {mode === 'login'
                        ? 'Chào mừng trở lại. Đăng nhập để theo dõi đơn hàng và lịch thử nếm.'
                        : 'Đăng ký thành viên để lưu lịch sử mua hàng và đặt lịch phòng nếm.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    aria-label="Đóng cửa sổ đăng nhập"
                    className="w-10 h-10 inline-flex items-center justify-center border border-[#DDD8CE] bg-[#FFFFFF] text-[#191715] hover:border-[#191715] transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Clean Underline Tab Switcher */}
                <div
                  role="tablist"
                  aria-label="Chuyển đổi giữa Đăng nhập và Đăng ký"
                  className="mt-6 flex items-center gap-6 border-b border-[#DDD8CE]"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    onClick={() => switchMode('login')}
                    className={`pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap ${
                      mode === 'login'
                        ? 'border-[#1F3A2E] text-[#191715]'
                        : 'border-transparent text-[#5C574F] hover:text-[#191715]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'register'}
                    onClick={() => switchMode('register')}
                    className={`pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap ${
                      mode === 'register'
                        ? 'border-[#1F3A2E] text-[#191715]'
                        : 'border-transparent text-[#5C574F] hover:text-[#191715]'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                  {mode === 'register' && (
                    <div>
                      <label
                        htmlFor="auth-display-name"
                        className="block text-sm font-medium text-[#191715] mb-1.5"
                      >
                        Họ và tên
                      </label>
                      <input
                        id="auth-display-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nguyễn Văn An"
                        autoComplete="name"
                        className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715] placeholder:text-[#8E887E] focus:outline-none focus:border-[#1F3A2E] transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="auth-username"
                      className="block text-sm font-medium text-[#191715] mb-1.5"
                    >
                      Tên đăng nhập
                    </label>
                    <input
                      id="auth-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={
                        mode === 'login' ? 'Nhập tên đăng nhập' : 'nguyenvanan'
                      }
                      autoComplete="username"
                      className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715] placeholder:text-[#8E887E] focus:outline-none focus:border-[#1F3A2E] transition-colors"
                    />
                    {mode === 'register' && (
                      <p className="mt-1 text-xs text-[#6B655C]">
                        Gồm 3–32 ký tự chữ thường không dấu, số hoặc dấu gạch dưới.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-sm font-medium text-[#191715] mb-1.5"
                    >
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === 'login' ? 'Nhập mật khẩu' : 'Tối thiểu 6 ký tự'
                        }
                        autoComplete={
                          mode === 'login' ? 'current-password' : 'new-password'
                        }
                        className="w-full h-11 pl-3.5 pr-11 bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715] placeholder:text-[#8E887E] focus:outline-none focus:border-[#1F3A2E] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="absolute right-0 top-0 h-11 w-11 inline-flex items-center justify-center text-[#5C574F] hover:text-[#191715] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    {/* Flat 3-Segment Password Strength Meter (Register Mode) */}
                    {mode === 'register' && password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                          {[1, 2, 3].map((step) => {
                            const active = strength.level >= step;
                            const barColor = !active
                              ? 'bg-[#EAE6DF]'
                              : strength.level === 1
                                ? 'bg-[#8E2A2A]'
                                : strength.level === 2
                                  ? 'bg-[#7A5C38]'
                                  : 'bg-[#1F3A2E]';
                            return <span key={step} className={`h-1 ${barColor}`} />;
                          })}
                        </div>
                        <p className="text-xs text-[#5C574F]">
                          Độ mạnh mật khẩu:{' '}
                          <span
                            className={`font-medium ${
                              strength.level === 1
                                ? 'text-[#8E2A2A]'
                                : strength.level === 2
                                  ? 'text-[#7A5C38]'
                                  : 'text-[#1F3A2E]'
                            }`}
                          >
                            {strength.label}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label
                        htmlFor="auth-confirm-password"
                        className="block text-sm font-medium text-[#191715] mb-1.5"
                      >
                        Xác nhận mật khẩu
                      </label>
                      <input
                        id="auth-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                        className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715] placeholder:text-[#8E887E] focus:outline-none focus:border-[#1F3A2E] transition-colors"
                      />
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="inline-flex items-center gap-2 text-sm text-[#5C574F] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 accent-[#1F3A2E] border border-[#DDD8CE] cursor-pointer"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                      </label>
                    </div>
                  )}

                  {activeError && (
                    <p
                      role="alert"
                      className="text-xs text-[#8E2A2A] bg-[#FDF6F6] border border-[#8E2A2A] px-3.5 py-2.5 leading-relaxed"
                    >
                      {activeError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="w-full h-11 bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {authBusy
                      ? 'Đang xử lý...'
                      : mode === 'login'
                        ? 'Đăng nhập'
                        : 'Tạo tài khoản'}
                  </button>
                </form>

                {/* Clean Divider */}
                <div className="relative flex items-center my-5">
                  <div className="flex-grow border-t border-[#DDD8CE]" />
                  <span className="mx-3 text-xs text-[#6B655C] whitespace-nowrap">
                    Hoặc tiếp tục với
                  </span>
                  <div className="flex-grow border-t border-[#DDD8CE]" />
                </div>

                {/* Official 4-Color Google Button */}
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={() => void signInWithGoogle()}
                  className="w-full h-11 bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-medium text-[#191715] hover:border-[#191715] hover:bg-[#F8F7F4] transition-colors inline-flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  <span>Tiếp tục với Google</span>
                </button>
              </div>

              {/* Footer Switch Link */}
              <p className="mt-6 pt-4 border-t border-[#EFECE6] text-center text-sm text-[#5C574F]">
                {mode === 'login' ? (
                  <>
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-medium text-[#1F3A2E] underline underline-offset-4 hover:text-[#191715] cursor-pointer"
                    >
                      Đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-medium text-[#1F3A2E] underline underline-offset-4 hover:text-[#191715] cursor-pointer"
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
