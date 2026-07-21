import KOT from '../model/kotModel.js';

// @desc    Create new KOT
// @route   POST /api/kot
export const createKOT = async (req, res) => {
  try {
    // Destructure properties sent by frontend (refNo & totalAmount)
    const { tableNo, refNo, items, totalAmount } = req.body;

    if (!tableNo || !items || items.length === 0) {
      return res.status(400).json({ message: 'Table number and items are required' });
    }

    const newKOT = await KOT.create({
      tableNo,
      refNo: refNo || '',
      items,
      totalAmount
    });

    // Returns created object with MongoDB _id
    res.status(201).json(newKOT);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single KOT by ID (THIS WAS MISSING FOR BILL PAGE)
// @route   GET /api/kot/:id
export const getKOTById = async (req, res) => {
  try {
    const kot = await KOT.findById(req.params.id);

    if (!kot) {
      return res.status(404).json({ message: 'Bill / KOT not found' });
    }

    res.status(200).json(kot);
  } catch (error) {
    // Handles invalid MongoDB ObjectId formats
    res.status(500).json({ message: 'Invalid Order ID format or server error' });
  }
};