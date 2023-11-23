import { mongooseConnect } from "@/lib/mongoose";
import Category from "@/models/Category";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === "GET") {
    const categories = await Category.find().populate("parent");

    res.status(200).json({ data: categories, message: "Fetched Categories" });
  }

  if (method === "POST") {
    const { name, parentCategory } = req.body;
    let data;

    if (parentCategory) {
      data = { name: name, parent: parentCategory };
    } else {
      data = { name: name };
    }
    const NewCategory = await new Category(data);

    await NewCategory.save();

    res.status(200).json({ data: NewCategory, message: "Category Created" });
  }
  if (method === "PUT") {
    const { name, parentCategory, _id } = req.body;
    const category = await Category.findById({ _id: _id });

    category.name = name;
    category.parent = parentCategory;
    await category.save();

    res.status(200).json({ data: category, message: "Category Edited" });
  }
  if (method === "DELETE") {
    const id = req.query?.id;

    await Category.deleteOne({ _id: id });

    res.status(200).json({ message: "Category Deleted" });
  }
}
