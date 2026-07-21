import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Zap, ArrowRight, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsLoading(true);
    try {
      await axiosClient.post('/auth/register', {
        fullName,
        userName: email.split('@')[0],
        email,
        password,
      });

      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Email hoặc tên tài khoản đã tồn tại.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-dark relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-flash-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-effect p-8 md:p-10 rounded-3xl border border-border-color shadow-2xl relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <Zap className="h-10 w-10 text-flash-red" />
            <span className="font-bold text-2xl tracking-tight text-white">Flash<span className="text-flash-red">Shop</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Đăng Ký Tài Khoản</h1>
          <p className="text-sm text-text-secondary">Tạo tài khoản mới để trải nghiệm dịch vụ mua sắm</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Họ và Tên</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-12 py-3 w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E92B2] mb-1.5 uppercase tracking-wide">Địa chỉ Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF1E27] z-10 pointer-events-none" />
              <input 
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark w-full"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E92B2] mb-1.5 uppercase tracking-wide">Mật khẩu</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF1E27] z-10 pointer-events-none" />
              <input 
                type="password"
                placeholder="Mật khẩu tối thiểu 6 ký tự..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark w-full"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full btn-primary py-4 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-flash-red/30 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang Đăng Ký...
              </>
            ) : (
              <>
                Tạo Tài Khoản Ngay <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-border-color text-center text-sm text-text-secondary">
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="text-flash-red hover:underline font-semibold">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
