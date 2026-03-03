const CategoryService = require("./category.service");

class CategoryController {
  static async create(req, res) {
    try {
      const { nome } = req.body;
      
      if (!nome) {
        return res.status(400).json({ erro: "Nome é obrigatório" });
      }

      const resultado = await CategoryService.create(nome);
      
      if (!resultado.sucesso) {
        return res.status(400).json({ erro: resultado.erro });
      }
      
      res.status(201).json(resultado.dados);
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const resultado = await CategoryService.findAll();
      
      if (!resultado.sucesso) {
        return res.status(400).json({ erro: resultado.erro });
      }
      
      res.json(resultado.dados);
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoryService.findById(id);
      
      if (!resultado.sucesso) {
        return res.status(404).json({ erro: resultado.erro });
      }
      
      res.json(resultado.dados);
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      
      if (!nome) {
        return res.status(400).json({ erro: "Nome é obrigatório" });
      }

      const resultado = await CategoryService.update(id, nome);
      
      if (!resultado.sucesso) {
        return res.status(404).json({ erro: resultado.erro });
      }
      
      res.json(resultado.dados);
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoryService.delete(id);
      
      if (!resultado.sucesso) {
        return res.status(400).json({ erro: resultado.erro });
      }
      
      res.json({ mensagem: resultado.mensagem });
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({ erro: error.message });
    }
  }
}

module.exports = CategoryController;