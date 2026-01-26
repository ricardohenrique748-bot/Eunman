import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Company
    const empresa = await prisma.empresa.create({
        data: {
            nomeFantasia: 'Eunaman Transportes',
            razaoSocial: 'Eunaman Logística LTDA',
            cnpj: '12.345.678/0001-90',
            ativo: true,
        }
    })
    console.log('Created Empresa:', empresa.nomeFantasia)

    // 2. Create Units
    const matriz = await prisma.unidade.create({
        data: {
            nomeUnidade: 'Matriz - SP',
            cidade: 'São Paulo',
            estado: 'SP',
            empresaId: empresa.id
        }
    })
    const filial = await prisma.unidade.create({
        data: {
            nomeUnidade: 'Filial - MG',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            empresaId: empresa.id
        }
    })

    // 3. Create Vehicles
    await prisma.veiculo.createMany({
        data: [
            {
                codigoInterno: 'V-01',
                tipoVeiculo: 'CAMINHAO',
                fabricante: 'Volvo',
                modelo: 'FH 540',
                placa: 'ABC-1234',
                ano: 2023,
                empresaId: empresa.id,
                unidadeId: matriz.id,
                status: 'DISPONIVEL',
                kmAtual: 54000,
                horimetroAtual: 2400
            },
            {
                codigoInterno: 'V-02',
                tipoVeiculo: 'CAMINHAO',
                fabricante: 'Scania',
                modelo: 'R 450',
                placa: 'DEF-5678',
                ano: 2022,
                empresaId: empresa.id,
                unidadeId: matriz.id,
                status: 'EM_MANUTENCAO',
                kmAtual: 120000,
                horimetroAtual: 5000,
                critico: true,
                observacoes: 'Problema recorrente na injeção'
            },
            {
                codigoInterno: 'E-001',
                tipoVeiculo: 'ESCAVADEIRA',
                fabricante: 'Caterpillar',
                modelo: '320 GC',
                ano: 2024,
                empresaId: empresa.id,
                unidadeId: filial.id,
                status: 'EM_OPERACAO',
                kmAtual: 0,
                horimetroAtual: 150
            }
        ]
    })
    console.log('Created 3 Vehicles')

    // 4. Create User
    await prisma.usuario.create({
        data: {
            nome: 'Ricardo Luz',
            email: 'admin@eunaman.com',
            senha: '123', // In real app, hash this
            perfil: 'ADMIN',
            empresaPadraoId: empresa.id,
            unidadePadraoId: matriz.id
        }
    })
    console.log('Created Admin User')

    console.log('✅ Seed finished successfully')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
