
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ORDERS_FILE = path.join(__dirname, "orders.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// Create orders.json if it does not exist
function initializeOrdersFile() {
    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
    }
}

// Read orders
function readOrders() {
    initializeOrdersFile();

    const data = fs.readFileSync(ORDERS_FILE, "utf8");
    const orders = JSON.parse(data);

    if (!Array.isArray(orders)) {
        throw new Error("orders.json must contain an array.");
    }

    return orders;
}

// Save orders
function saveOrders(orders) {
    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 2),
        "utf8"
    );
}

// Find order by ID
function findOrder(orders, id) {
    return orders.find(order => order.id === id);
}

// Server status
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "CraveCraft backend is running!"
    });
});

// Get all orders
app.get("/api/orders", (req, res) => {
    try {
        res.set("Cache-Control", "no-store");

        res.json({
            success: true,
            orders: readOrders()
        });
    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Could not retrieve orders."
        });
    }
});

// Place a new order
app.post("/api/orders", (req, res) => {
    try {
        const { customerName, phone, items, total } = req.body;

        if (
            typeof customerName !== "string" ||
            !customerName.trim() ||
            !Array.isArray(items) ||
            items.length === 0 ||
            !Number.isFinite(Number(total)) ||
            Number(total) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order information."
            });
        }

        const orders = readOrders();

        const order = {
            id: `CC${Date.now()}`,
            customerName: customerName.trim(),
            phone: typeof phone === "string" ? phone.trim() : "",
            items,
            total: Number(total),
            status: "Order Placed",
            location: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(order);
        saveOrders(orders);

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order
        });
    } catch (error) {
        console.error("Place order error:", error);

        res.status(500).json({
            success: false,
            message: "Could not save the order."
        });
    }
});

// Get one order
app.get("/api/orders/:id", (req, res) => {
    try {
        res.set("Cache-Control", "no-store");

        const orders = readOrders();
        const order = findOrder(orders, req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Get single order error:", error);

        res.status(500).json({
            success: false,
            message: "Could not retrieve order."
        });
    }
});

// Update order status
app.patch("/api/orders/:id/status", (req, res) => {
    try {
        const allowedStatuses = [
            "Order Placed",
            "Preparing",
            "Ready for Pickup",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        const orders = readOrders();
        const order = findOrder(orders, req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();

        saveOrders(orders);

        res.json({
            success: true,
            message: "Order status updated!",
            order
        });
    } catch (error) {
        console.error("Update status error:", error);

        res.status(500).json({
            success: false,
            message: "Could not update order status."
        });
    }
});

// Save delivery GPS location
app.post("/api/orders/:id/location", (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid GPS coordinates."
            });
        }

        const orders = readOrders();
        const order = findOrder(orders, req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {
            return res.status(409).json({
                success: false,
                message: "Tracking is closed for this order."
            });
        }

        order.location = {
            latitude,
            longitude,
            updatedAt: new Date().toISOString()
        };

        order.updatedAt = new Date().toISOString();

        saveOrders(orders);

        res.json({
            success: true,
            message: "GPS location updated.",
            location: order.location
        });
    } catch (error) {
        console.error("GPS update error:", error);

        res.status(500).json({
            success: false,
            message: "Could not update GPS location."
        });
    }
});

// Stop sharing GPS location
app.delete("/api/orders/:id/location", (req, res) => {
    try {
        const orders = readOrders();
        const order = findOrder(orders, req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        order.location = null;
        order.updatedAt = new Date().toISOString();

        saveOrders(orders);

        res.json({
            success: true,
            message: "GPS sharing stopped."
        });
    } catch (error) {
        console.error("Stop GPS error:", error);

        res.status(500).json({
            success: false,
            message: "Could not stop GPS sharing."
        });
    }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`CraveCraft server running on port ${PORT}`);
});

