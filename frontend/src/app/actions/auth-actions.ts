'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // In a real app, we would hash/verify the password
    const user = await prisma.usuario.findUnique({
        where: { email },
        include: {
            unidadePadrao: true
        }
    })

    if (!user || user.senha !== password) {
        return { success: false, error: 'Credenciais inválidas' }
    }

    if (!user.ativo) {
        return { success: false, error: 'Usuário desativado' }
    }


    // Check if password change is required
    if (user.trocarSenha) {
        return { success: false, mustChangePassword: true, email: user.email }
    }

    // Set a simple cookie for "session"
    // In a real app, use JWT or a secure session store
    const sessionData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        area: user.area,
        unidadeId: user.unidadePadraoId
    }

    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    return { success: true, perfil: user.perfil }
}

export async function updatePassword(formData: FormData) {
    const email = formData.get('email') as string
    const newPassword = formData.get('newPassword') as string

    if (!email || !newPassword) {
        return { success: false, error: 'Dados inválidos' }
    }

    try {
        const user = await prisma.usuario.findUnique({ where: { email } })
        if (!user) return { success: false, error: 'Usuário não encontrado' }

        await prisma.usuario.update({
            where: { email },
            data: {
                senha: newPassword,
                trocarSenha: false
            }
        })

        // Auto-login after password change? 
        // Or just return success so frontend can re-login or we can set cookie here.
        // Let's set cookie here for seamless experience
        const sessionData = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            perfil: user.perfil,
            area: user.area,
            unidadeId: user.unidadePadraoId
        }

        const cookieStore = await cookies()
        cookieStore.set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        })

        return { success: true }
    } catch (error) {
        console.error("Update password error", error)
        return { success: false, error: 'Erro ao atualizar senha' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    if (!session) return null
    return JSON.parse(session.value)
}

export async function requestPasswordReset(email: string) {
    if (!email) return { success: false, error: 'Email obrigatório' }

    // In a real app, send email or create a reset token in DB
    // For now, we simulate success to confirm "sent to system"
    console.log(`[Password Reset Request] Email: ${email}`)

    return { success: true }
}
