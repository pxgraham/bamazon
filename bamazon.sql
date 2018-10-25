DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price INT NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);

USE bamazon;
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("Skull Mask", "Costumes", "16", "100"),
("Banana", "Produce", "2", "5"),
("Machete", "Tools", "25", "50"),
("Broccoli", "Produce", "1", "100"),
("Gold Crown", "Costumes", "16900", "1");

USE bamazon;
SELECT * FROM products;

USE bamazon;
UPDATE products SET stock_quantity = 2 WHERE product_name = 'Gold Crown';


