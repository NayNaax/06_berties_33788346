# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price)VALUES('Brighton Rock', 20.25),('Brave New World', 25.00), ('Animal Farm', 12.99) ;

INSERT INTO users (username, first, last, email, hashedPassword) VALUES ('gold', 'Gold', 'Member', 'gold@example.com', '$2b$10$4CaozR6p/KOF.6NDBol.muHTh2PmcelZvyh42IwS63Al.su3wEXg6');
