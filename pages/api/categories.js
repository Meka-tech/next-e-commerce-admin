import { mongooseConnect } from "@/lib/mongoose";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    const categories = await Category.find().populate("parent");

    res.status(200).json({ data: categories, message: "Fetched Categories" });
  }

  if (method === "POST") {
    const { name, parentCategory, properties } = req.body;
    let data = { name, properties };

    if (parentCategory) {
      data.parent = parentCategory;
    }
    const NewCategory = await new Category(data);

    await NewCategory.save();

    res.status(200).json({ data: NewCategory, message: "Category Created" });
  }
  if (method === "PUT") {
    const { name, parentCategory, properties, _id } = req.body;

    const category = await Category.findById({ _id: _id });

    category.name = name;
    category.properties = properties;

    if (parentCategory !== "1") {
      category.parent = parentCategory;
    } else {
      category.parent = undefined;
    }
    await category.save();

    res.status(200).json({ data: category, message: "Category Edited" });
  }
  if (method === "DELETE") {
    const id = req.query?.id;

    await Category.deleteOne({ _id: id });

    res.status(200).json({ message: "Category Deleted" });
  }
}
