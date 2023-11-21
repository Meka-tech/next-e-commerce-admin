import { mongooseConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function handler(req, res) {
  const { method } = req;
  console.log(req.body);
  await mongooseConnect();

  if (method === "POST") {
    const { title, description, price, images } = req.body;
    console.log(images);
    const productDoc = new Product({ title, description, images, price });
    await productDoc.save();

    res
      .status(200)
      .json({ product: productDoc, message: "Product created successfully" });
  }
  if (method === "GET") {
    const id = req.query?.id;
    if (id) {
      const product = await Product.findOne({ _id: id });
      res
        .status(200)
        .json({ product: product, message: "Product fetched successfully" });
    } else {
      const Products = await Product.find();
      res
        .status(200)
        .json({ products: Products, message: "Products fetched successfully" });
    }
  }

  if (method === "PUT") {
    const { title, description, price, images, _id } = req.body;

    // await Product.updateOne(
    //   { _id },
    //   { title: title, description: description, price: price }
    // );

    const editedProduct = await Product.findOne({ _id: _id });
    editedProduct.title = title;
    editedProduct.description = description;
    editedProduct.price = price;
    editedProduct.images = images;
    await editedProduct.save();

    res
      .status(200)
      .json({ product: editedProduct, message: "Product edited successfully" });
  }
  if (method === "DELETE") {
    const id = req.query?.id;
    if (id) {
      const product = await Product.deleteOne({ _id: id });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  }
}
