import { Router } from "express";

//=========================Clientes============================================================
import { CreateClientController } from "../controllers/client/createClientController.js";
import { getClientController } from "../controllers/client/getClientController.js";

//=============================Produtos===============================================
import { createProductController } from "../controllers/product/createProductController.js";

//=============================Categorias===========================
import { createCategoryController } from "../controllers/category/createCategoryController.js";

//====================Menu==================================================================
import { createCardapioController } from "../controllers/menu/createMenuController.js";
import { createCardapioItemController } from "../controllers/menu/createMenuItemController.js";
import { getMenuController } from "../controllers/menu/getMeuController.js";

//============================CARRINHO DE COMPRA===========================================================
import { createCartController } from "../controllers/car/createCarController.js";
import { createCartItemController } from "../controllers/car/createCartItemController.js";
import { createCartItemAdditionalController } from "../controllers/car/createCartItemAdicionalController.js";
import { cartRemoveController } from "../controllers/car/cartRemoveController.js";
import { getCartController } from "../controllers/car/getCartController.js";
import { calculateCartController } from "../controllers/car/calculateCartController.js";

//=============================Adicionais para produto=============================
//////import { createAdditionalController } from "../controllers/adicional/createAdditionalController.js";
//import { createProductAdditionalController } from "../controllers/adicional/creatProductAdditionalController.js";
//import { getAdditionalController } from "../controllers/adicional/getAdditionalController.js";

//=============================BAIRRO=============================
import { createBairroController } from "../controllers/neighborhood/createNeighborhoodController.js";
import { listBairroController } from "../controllers/neighborhood/listNeiborhoodController.js";
import { getBairroController } from "../controllers/neighborhood/getIdNeighborhoodController.js";

//============================PEDIDO============================
import { createPedidoController } from "../controllers/order/createOrderController.js";
import { confirmOrderController } from "../controllers/order/confirmOrderController.js";
import { cancelOrderController } from "../controllers/order/cancelOrderController.js";
import { startPreparationOrderController } from "../controllers/order/startPreparationOrderController.js";
import { readyPreparationOrderController } from "../controllers/order/readyPreparationOrderController.js";
import { saiuEntregaOrderController } from "../controllers/order/outForDeliveryOrderController.js";
import { entregueOrderController } from "../controllers/order/deliveredOrderController.js";
import { getOrderController } from "../controllers/order/getIdOrderController.js";
import { getProductController } from "../controllers/product/getProductController.js";
import { getIdProductController } from "../controllers/product/getIdProductController.js";
import { getCategoryController } from "../controllers/category/getCategoryController.js";
import { getIdCategoryController } from "../controllers/category/getIdCategoryController.js";
import { getAllOrderController } from "../controllers/order/getAllOrderController.js";
import { DeleteCartItem } from "../controllers/car/DeleteCartItemController.js";
import { TransferirAtendimento } from "../controllers/client/AtendimentoClientController.js";
//import { ListarProdutosComAdicionaisController } from "../controllers/adicional/lostarProdutosAdicionaisController.js";

//=============================================Quentinha=================================================
import { OpcaoQuentinhaController } from "../controllers/quentinhaController/criarQuentinhaController.js";
import { CarrinhoItemEscolhaController } from "../controllers/quentinhaController/itemCarrinhoQuentinhaController.js";
import { tamanhoQuentinhaController } from "../controllers/quentinhaController/tamanhoQuentinhaController.js";

//===========================================Refrigerantes=======================================================
import { CadastrarRefrigeranteController } from "../controllers/refrigentesController/cadastrarRefrigeranteController.js";
import { CadastrarListaRefrigerantesController } from "../controllers/refrigentesController/cadastrarListaRefrigerantesController.js";
import { ConsultarListRefrigerantesController } from "../controllers/refrigentesController/consultarListRefrigeranteController.js";
import { ConsultarIdRefrigerantesController } from "../controllers/refrigentesController/consultarIdRefrigeranteController.js";

const router = Router();

const createClientController = new CreateClientController();

//====================================Refrigerantes=========================================
router.get(
  "/consultarRefrigeranteId/:id",
  new ConsultarIdRefrigerantesController().handle,
);
router.get(
  "/consultarListaRefrigerantes",
  new ConsultarListRefrigerantesController().handle,
);

router.post(
  "/cadastrarRefrigerante",
  new CadastrarRefrigeranteController().handle,
);

router.post(
  "/cadastrarListaRefrigerantes",
  new CadastrarListaRefrigerantesController().handle,
);

//===================================QUENTINHA=========================================
router.post("/criarQuentinha", new OpcaoQuentinhaController().criar);
router.get("/buscarQuentinha", new OpcaoQuentinhaController().listar);
router.get("/quentinhaId/:id", new OpcaoQuentinhaController().buscarPorId);
router.put("/quentinhaId/:id", new OpcaoQuentinhaController().atualizar);
router.patch("/:id/desativar", new OpcaoQuentinhaController().desativar);

//===========================QuentinhaCarrinho==============================
router.post(
  "/criarCarrinhoQuentinha",
  new CarrinhoItemEscolhaController().criar,
);

router.get(
  "/buscar-carrinho-item/:carrinhoItemId",
  new CarrinhoItemEscolhaController().listar,
);

router.get("/quentinha/:id", new CarrinhoItemEscolhaController().buscarPorId);

router.delete("/quentinha/:id", new CarrinhoItemEscolhaController().excluir);

//====================================Tamanho e valores dequentinha========================
router.post("/tamanho-quentinha", new tamanhoQuentinhaController().create);

// =====================Rotas de Clientes==================================================
router.post("/clients", (req, res) => createClientController.handle(req, res));
router.post("/clientes", (req, res) => createClientController.handle(req, res));
router.get("/getClient", new getClientController().handle);
router.post("/transferir-atendimento", new TransferirAtendimento().handle);

//========================Rota de Produtos==========================================
router.post("/createProduct", new createProductController().handle);
router.get("/getProduct", new getProductController().handle);
router.get("/productId/:id", new getIdProductController().handle);

//==============================Categorias deProdutos===================================
router.post("/createCategory", new createCategoryController().handle);
router.get("/getCategory", new getCategoryController().handle);
router.get("/categoryId/:id", new getIdCategoryController().handle);

//======================MENU==========================================================
router.post("/menu", new createCardapioController().handle);
router.post("/menuItem", new createCardapioItemController().handle);
router.get("/getMenu", new getMenuController().handle);

//==================================CARRINHO DE COMPRAS=========================
router.post("/cart", new createCartController().handle);
router.post("/cartItem", new createCartItemController().handle);
router.post(
  "/cart-item-additional",
  new createCartItemAdditionalController().handle,
);
router.post("/cart-item-remove", new cartRemoveController().handle);
router.get("/getCart/:id", new getCartController().handle);
router.post("/calculateCart", new calculateCartController().handle);
router.delete("/deleteCartItem", new DeleteCartItem().execute);

//=========================ADICIONAIS PARA PRODUTOS=============
//router.post("/createAdditional", new createAdditionalController().handle);
//router.post(
// "/product-additional",
//new createProductAdditionalController().handle,
//);
//router.get("/getAdicional", new getAdditionalController().handle);
//router.get(
// "/listarAdicionaisProduto",
// new ListarProdutosComAdicionaisController().handle,
//);

//===================================Bairro=======================================
router.post("/createBairro", new createBairroController().handle);
router.get("/listBairro", new listBairroController().handle);
router.get("/getBairro/:id", new getBairroController().handle);

//===================================Order=========================
router.post("/createOrder", new createPedidoController().handle);
router.post("/confirmOrder/:id/confirmar", new confirmOrderController().handle);
router.post("/confirmOrder/:id/cancel", new cancelOrderController().handle);
router.post(
  "/confirmOrder/:id/iniciar",
  new startPreparationOrderController().handle,
);
router.post(
  "/confirmOrder/:id/pronto",
  new readyPreparationOrderController().handle,
);
router.post(
  "/confirmOrder/:id/saiuEntrega",
  new saiuEntregaOrderController().handle,
);
router.post("/confirmOrder/:id/entregue", new entregueOrderController().handle);
router.get("/getOrder/:id", new getOrderController().handle);

router.get("/orderAll", new getAllOrderController().handle);

export { router };
