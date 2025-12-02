import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";
import axios from "axios";
import SSLCommerzPayment from "sslcommerz-lts";
import nodemailer from "nodemailer";


export const createEOrder = async (req, res) => {
  try {
    const {
      cartId,
      name,
      email,
      phoneNumber,
      address,
      paymentMethod,
      paymentType,
      paymentDone,
      status,
      data,
      deliveryCharge,
    } = req.body;

    // Fetch cart items with product info
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { eProduct: true } } },
    });

    if (!cart) {
      return res.status(404).json(jsonResponse(false, "Cart not found", null));
    }

    // Calculate subtotal, VAT, total
    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.eProduct?.price || 0) * item.quantity,
      0
    );
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat + deliveryCharge;

    // Create the order
    const order = await prisma.eOrder.create({
      data: {
        name,
        email,
        phoneNumber,
        address,
        paymentMethod,
        paymentType,
        paymentDone,
        status: status ?? "PENDING",
        data,
        vat,
        deliveryCharge,
        cart: { connect: { id: cartId } },
      },
      include: { cart: { include: { items: { include: { eProduct: true } } } } },
    });

    // Generate email body
    const generateEmailBody = (recipientName, isCustomer = false) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #5255df;">${isCustomer ? "Thank You for Your Order!" : "New Order Received!"}</h2>
        <p>${isCustomer 
          ? `Dear <b>${recipientName}</b>, thank you for shopping with GSZ MART! Your order has been successfully placed.` 
          : `A new order has been placed by <b>${recipientName}</b>.`}</p>

        <h3>Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f7f7f7;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Size</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Color</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cart.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.eProduct?.name || "Unnamed Product"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.size}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.color}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">৳${(item.eProduct?.price || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">৳${(
                  (item.eProduct?.price || 0) * item.quantity
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <p><b>Delivery Address:</b> ${address}</p>
        <p><b>Phone Number:</b> ${phoneNumber}</p>

        <p><b>Payment Method:</b> ${paymentMethod === "cod" ? "Cash on Delivery" : paymentType}</p>

        <p><b>Subtotal:</b> ৳${subtotal.toFixed(2)}</p>
        <p><b>VAT (15%):</b> ৳${vat.toFixed(2)}</p>
        <p><b>Delivery Charge:</b> ৳${deliveryCharge}</p>

        <p style="font-size: 20px; font-weight: 700; color: #e74c3c; margin-top: 12px;">
          Total: ৳${total.toFixed(2)}
        </p>

        ${isCustomer ? `<p style="font-size: 16px; font-weight: 500; color: #333;">We appreciate your trust and hope you enjoy your purchase!</p>` : ""}

        <h3>Company Information</h3>
        <p>
          Primary Location:<br/>
          1224 E Baltimore Ave, Fort Worth, TX, 76104, United States<br/>
          📞 Phone: +1 409-419-3426
        </p>
        <p>
          Secondary Location:<br/>
          House: 331/11, Flat# 6C, TV Link Road, East Rampura, Rampura, Dhaka -1219, Bangladesh<br/>
          📞 Phone: +8801729631431
        </p>
        <p>
          <a href="https://www.facebook.com/gszmart" target="_blank" style="color: #5255df; font-size: 18px; font-weight: 700; text-decoration: none; animation: pulse 1.5s infinite;">GSZ MART Facebook</a><br/>
          <a href="https://www.globalservicezone.com/e-commerce" target="_blank" style="color: #5255df; font-size: 18px; font-weight: 700; text-decoration: none; animation: pulse 1.5s infinite;">globalservicezone.com E-Commerce</a>
        </p>

        <style>
          @keyframes pulse {
            0% { transform: scale(1); color: #5255df; }
            50% { transform: scale(1.05); color: #222; }
            100% { transform: scale(1); color: #5255df; }
          }
        </style>
      </div>
    `;

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Send to Admin
    await transporter.sendMail({
      from: `"GSZ MART" <${process.env.GMAIL_ID}>`,
      to: "info@globalservicezone.com", // Admin email
      subject: `New Order Received - ${name}`,
      html: generateEmailBody(name, false),
    });

    // Send to Customer
    await transporter.sendMail({
      from: `"GSZ MART" <${process.env.GMAIL_ID}>`,
      to: email,
      subject: `Thank You for Your Order, ${name}`,
      html: generateEmailBody(name, true),
    });

    return res
      .status(201)
      .json(jsonResponse(true, "Order created, emails sent to admin and customer", order));

  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(jsonResponse(false, error.message || "Internal Server Error", null));
  }
};

// Update EOrder
export const updateEOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, // <-- added
      email,
      phoneNumber,
      address,
      paymentMethod,
      paymentType,
      paymentDone,
      status,
      data,
      vat,
      deliveryCharge,
    } = req.body;

    const order = await prisma.eOrder.update({
      where: { id },
      data: {
        name, // <-- added
        email,
        phoneNumber,
        address,
        paymentMethod,
        paymentType,
        paymentDone,
        status,
        data,
        vat,
        deliveryCharge,
      },
      include: { cart: { include: { items: true } } },
    });

    return res.status(200).json(jsonResponse(true, "Order updated", order));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update EOrder status by ID
export const updateEOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const order = await prisma.eOrder.update({
      where: { id },
      data: { status },
      include: { cart: { include: { items: true } } },
    });
    return res
      .status(200)
      .json(jsonResponse(true, "Order status updated", order));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Show all EOrders
export const getEOrders = async (req, res) => {
  try {
    const orders = await prisma.eOrder.findMany({
      include: { cart: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(jsonResponse(true, "Orders found", orders));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get EOrder by ID
export const getEOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.eOrder.findUnique({
      where: { id },
      include: {
        cart: {
          include: {
            items: {
              include: {
                eProduct: { select: { name: true, image: true } },
              },
            },
          },
        },
      },
    });
    if (!order) {
      return res.status(404).json(jsonResponse(false, "Order not found", null));
    }
    return res.status(200).json(jsonResponse(true, "Order found", order));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

export const getEOrderByIdOrEmailOrPhone = async (req, res) => {
  try {
    const { id, email, phoneNumber } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!id && !email && !phoneNumber) {
      return res.status(400).json(jsonResponse(false, "Provide id, email, or phoneNumber", null));
    }

    const where = {
      OR: [
        id ? { id } : undefined,
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean),
    };

    const [orders, total] = await Promise.all([
      prisma.eOrder.findMany({
        where,
        include: {
          cart: {
            include: {
              items: {
                include: {
                  eProduct: { select: { name: true, image: true, price: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.eOrder.count({ where }),
    ]);

    if (!orders || orders.length === 0) {
      return res.status(404).json(jsonResponse(false, "Order(s) not found", null));
    }

    // Calculate totals for each order
    const ordersWithTotals = orders.map(order => {
      let subtotal = 0;
      if (order.cart && order.cart.items) {
        subtotal = order.cart.items.reduce((sum, item) => {
          const price = item.eProduct?.price || 0;
          const quantity = item.quantity || 0;
          return sum + price * quantity;
        }, 0);
      }
      const vatAmount = subtotal * ((order.vat || 0) / 100);
      const deliveryCharge = order.deliveryCharge || 0;
      const total = subtotal + vatAmount + deliveryCharge;

      return {
        ...order,
        subtotal,
        vatAmount,
        deliveryCharge,
        total,
      };
    });

    return res.status(200).json(jsonResponse(true, "Order(s) found", {
      orders: ordersWithTotals,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update these values for sandbox/test environment
const store_id = "globa68069d46609e8";
const store_passwd = "globa68069d46609e8@ssl";
const is_live = false; // false for sandbox, true for live

export const initiateSslCommerzPayment = async (req, res) => {
  try {
    const {
      total_amount,
      currency = "BDT",
      tran_id,
      success_url,
      fail_url,
      cancel_url,
      cus_name,
      cus_email,
      cus_add1,
      cus_add2 = "",
      cus_city,
      cus_state = "",
      cus_postcode = "",
      cus_country = "Bangladesh",
      cus_phone,
      cus_fax = "",
      // Add any other required fields here
    } = req.body;

    // Validate required fields
    if (
      !total_amount ||
      !tran_id ||
      !success_url ||
      !fail_url ||
      !cancel_url ||
      !cus_name ||
      !cus_email ||
      !cus_add1 ||
      !cus_city ||
      !cus_postcode ||
      !cus_country ||
      !cus_phone
    ) {
      return res
        .status(400)
        .json(jsonResponse(false, "Missing required payment fields", null));
    }

    // Prepare data for SSLCommerzPayment
    const data = {
      total_amount,
      currency,
      tran_id,
      success_url,
      fail_url,
      cancel_url,
      shipping_method: "Courier",
      product_name: "Product",
      product_category: "Product",
      product_profile: "general",
      cus_name,
      cus_email,
      cus_add1,
      cus_add2,
      cus_city,
      cus_state,
      cus_postcode,
      cus_country,
      cus_phone,
      cus_fax,
      ship_name: cus_name,
      ship_add1: cus_add1,
      ship_add2: cus_add2,
      ship_city: cus_city,
      ship_state: cus_state,
      ship_postcode: cus_postcode,
      ship_country: cus_country,
    };

    // Use sandbox endpoint by setting is_live = false
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      return res.status(400).json(
        jsonResponse(false, "Failed to get Gateway URL", {
          error: apiResponse,
        })
      );
    }

    let GatewayPageURL = apiResponse.GatewayPageURL;

    if (!res.headersSent) {
      return res.status(200).json(
        jsonResponse(true, "Redirecting to SSL COMMERZ.", {
          gateway: GatewayPageURL,
        })
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};
