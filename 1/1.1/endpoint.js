app.get('/api/orders', authenticateToken, async (req, res, next) => {
    try {
        // 1. Obtener el usuario autenticado desde el servidor
        const userId = req.user.id;

        // 2. Validar los parámetros de paginación
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
        );

        const offset = (page - 1) * limit;

        // 3. Consultar los pedidos utilizando parámetros SQL
        const ordersResult = await db.query(
            `SELECT
                id,
                user_id,
                total,
                status,
                created_at
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC, id DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const orders = ordersResult.rows;

        // 4. Obtener los artículos de todos los pedidos
        if (orders.length > 0) {
            const orderIds = orders.map(order => order.id);

            const itemsResult = await db.query(
                `SELECT
                    id,
                    order_id,
                    product_id,
                    quantity,
                    price
                 FROM order_items
                 WHERE order_id = ANY($1::int[])
                 ORDER BY order_id`,
                [orderIds]
            );

            // 5. Agrupar los artículos por pedido
            const itemsByOrder = {};

            for (const item of itemsResult.rows) {
                if (!itemsByOrder[item.order_id]) {
                    itemsByOrder[item.order_id] = [];
                }

                itemsByOrder[item.order_id].push(item);
            }

            for (const order of orders) {
                order.items = itemsByOrder[order.id] || [];
            }
        }

        // 6. Responder al cliente
        return res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                count: orders.length
            }
        });

    } catch (error) {
        // Delegar el error al middleware centralizado
        return next(error);
    }
});
