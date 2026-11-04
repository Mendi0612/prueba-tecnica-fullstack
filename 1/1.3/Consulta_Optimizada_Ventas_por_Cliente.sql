SELECT
    c.id AS customer_id,
    c.name,
    COUNT(DISTINCT o.id) AS orders,
    COALESCE(
        SUM(oi.quantity * oi.unit_price),
        0
    ) AS revenue
FROM customers c
JOIN orders o
    ON o.customer_id = c.id
JOIN order_items oi
    ON oi.order_id = o.id
WHERE o.created_at >= TIMESTAMP '2026-10-01 00:00:00'
  AND o.created_at < TIMESTAMP '2026-10-02 00:00:00'
GROUP BY c.id, c.name
ORDER BY revenue DESC;