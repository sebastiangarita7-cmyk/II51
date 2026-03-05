CREATE TABLE Usuarios (
	Id INT PRIMARY KEY IDENTITY(1,1),
	Nombre NVARCHAR(100) NOT NULL,
	Edad INT NOT NULL,
);
INSERT INTO Usuarios (Nombre, Edad) 
VALUES ('Ana', 25);

INSERT INTO Usuarios (Nombre, Edad) 
VALUES ('Carlos', 30);

INSERT INTO Usuarios (Nombre, Edad) 
VALUES ('Maria', 28);
 
 SELECT * FROM Usuarios;
 GO

 UPDATE Usuarios
SET Edad = 31
WHERE Id = 2;
GO

SELECT * FROM Usuarios;

DELETE FROM Usuarios
WHERE Id = 1;
GO

SELECT * FROM Usuarios;
