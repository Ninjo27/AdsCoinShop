import { useState } from 'react'
import supabase from '../lib/supabase'
import axios from 'axios'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async () => {
    setLoading(true)
    setMessage('')
    const { email, password, username } = form

    try {
      // 1. Tạo user Auth
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error || !data.user) throw error

      const userId = data.user.id

      // 2. Ghi thêm vào bảng users_info
      await supabase.from('users_info').insert([
        { id: userId, username, ads_coin: 0, role: 'user' }
      ])

      // 3. Gửi Discord webhook
      await axios.post(
        process.env.NEXT_PUBLIC_DISCORD_REGISTER_HOOK!,
        { content: `🆕 Người dùng mới vừa đăng ký: **${username}**` }
      )

      setMessage('🎉 Đăng ký thành công! Hãy kiểm tra email để xác nhận.')
    } catch (err: any) {
      setMessage('❌ Đăng ký thất bại: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Tạo tài khoản mới</h2>
      <input
        name="username"
        placeholder="Tên người dùng"
        className="mb-2 w-full p-2 border rounded"
        value={form.username}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="mb-2 w-full p-2 border rounded"
        value={form.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Mật khẩu"
        className="mb-4 w-full p-2 border rounded"
        value={form.password}
        onChange={handleChange}
      />
      <button
        className="bg-indigo-600 text-white py-2 px-4 rounded w-full"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  )
}
