const prisma = require("../../database/prisma");
const serialize = require("../../shared/utils/serialize");

class CategoryService {
  static async create(nome) {
    try {
      const categoria = await prisma.categoria.create({
        data: { nome }
      });

      return {
        sucesso: true,
        dados: serialize(categoria)
      };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return {
        sucesso: false,
        erro: "Erro ao criar categoria: " + error.message
      };
    }
  }

  static async findAll() {
    try {
      const categorias = await prisma.categoria.findMany({
        include: { 
          produtos: {
            select: {
              id: true,
              nome: true,
              valor: true,
              estoque: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      });

      return {
        sucesso: true,
        dados: serialize(categorias)
      };
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      return {
        sucesso: false,
        erro: "Erro ao listar categorias: " + error.message
      };
    }
  }

  static async findById(id) {
    try {
      const categoria = await prisma.categoria.findUnique({
        where: { id: parseInt(id) },
        include: { 
          produtos: {
            select: {
              id: true,
              nome: true,
              valor: true,
              estoque: true,
              descricao: true
            }
          }
        }
      });

      if (!categoria) {
        return {
          sucesso: false,
          erro: "Categoria não encontrada"
        };
      }

      return {
        sucesso: true,
        dados: serialize(categoria)
      };
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return {
        sucesso: false,
        erro: "Erro ao buscar categoria: " + error.message
      };
    }
  }

  static async update(id, nome) {
    try {
      const existe = await prisma.categoria.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existe) {
        return {
          sucesso: false,
          erro: "Categoria não encontrada"
        };
      }

      const categoria = await prisma.categoria.update({
        where: { id: parseInt(id) },
        data: { nome }
      });

      return {
        sucesso: true,
        dados: serialize(categoria)
      };
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return {
        sucesso: false,
        erro: "Erro ao atualizar categoria: " + error.message
      };
    }
  }

  static async delete(id) {
    try {
      const existe = await prisma.categoria.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existe) {
        return {
          sucesso: false,
          erro: "Categoria não encontrada"
        };
      }

      const temProdutos = await prisma.produtos.count({
        where: { categoria_id: parseInt(id) }
      });

      if (temProdutos > 0) {
        return {
          sucesso: false,
          erro: "Não é possível excluir categoria com produtos vinculados"
        };
      }

      await prisma.categoria.delete({
        where: { id: parseInt(id) }
      });

      return {
        sucesso: true,
        mensagem: "Categoria deletada com sucesso"
      };
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      return {
        sucesso: false,
        erro: "Erro ao deletar categoria: " + error.message
      };
    }
  }
}

module.exports = CategoryService;