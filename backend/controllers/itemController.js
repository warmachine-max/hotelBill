import MenuItem from "../model/MenuItem.js";

// @desc    Get all menu items (or search dynamically by typing: /api/items?name=d)
// @route   GET /api/items
export const getMenuItems = async (req, res) => {
  try {
    const { name } = req.query;
    let filter = {};

    // If user types letters in search bar, filter items dynamically
    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // 'i' makes it case-insensitive
    }

    const items = await MenuItem.find(filter).sort({ name: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new menu item
// @route   POST /api/items
// @desc    Create a new menu item
// @route   POST /api/items
export const createMenuItem = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Please provide both name and price' });
    }

    // Check for existing duplicate item (case-insensitive search)
    const existingItem = await MenuItem.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingItem) {
      return res.status(400).json({ 
        message: `"${name.trim()}" already exists in the menu!` 
      });
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      price: Number(price)
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/items/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await MenuItem.findByIdAndDelete(id);
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item by ID
// @route   PUT /api/items/:id
export const updateMenuItem = async (req, res) => {
  try {
    const { name, price } = req.body;
    
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    item.name = name || item.name;
    item.price = price !== undefined ? price : item.price;

    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};