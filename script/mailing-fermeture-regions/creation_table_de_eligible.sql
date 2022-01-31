--on se fiche du type de données, il y a des null partout alors on met des varchar, on veut simplement récupérer les idRci

CREATE TABLE de_eligible (
     id VARCHAR(50),
     id_rci VARCHAR(50),
     id_individu VARCHAR(50),
     prenom VARCHAR(50),
     nom VARCHAR(50),
     sexe VARCHAR(1),
     email VARCHAR(255),
     code_postale VARCHAR(50),
     code_ale VARCHAR(50),
     departement VARCHAR(50),
     region VARCHAR(50),
     radie VARCHAR(50),
     situation VARCHAR(50),
     actu_faite VARCHAR(50)
);

COPY de_eligible(id, id_rci, id_individu, prenom,nom,sexe,email,code_postale,code_ale,departement,region,radie,situation,actu_faite)
FROM '/zen_de_eligible_full.csv'
DELIMITER '|'
CSV HEADER;
