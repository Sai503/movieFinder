-- MySQL dump 10.13  Distrib 8.0.18, for macos10.14 (x86_64)
--
-- Host: 127.0.0.1    Database: movieFinder
-- ------------------------------------------------------
-- Server version	8.0.18

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `choiceTypes`
--

DROP TABLE IF EXISTS `choiceTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `choiceTypes` (
  `choiceID` int(11) NOT NULL AUTO_INCREMENT,
  `choiceName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`choiceID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `choiceTypes`
--

LOCK TABLES `choiceTypes` WRITE;
/*!40000 ALTER TABLE `choiceTypes` DISABLE KEYS */;
INSERT INTO `choiceTypes` VALUES (1,'No'),(2,'Yes'),(3,'Watched');
/*!40000 ALTER TABLE `choiceTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movieList`
--

DROP TABLE IF EXISTS `movieList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movieList` (
  `userID` bigint(20) NOT NULL,
  `movieID` int(11) NOT NULL,
  `choiceID` int(11) NOT NULL,
  PRIMARY KEY (`userID`,`movieID`),
  KEY `movieID` (`movieID`),
  KEY `movieList_choiceTypes_choiceID_fk` (`choiceID`),
  CONSTRAINT `movieList_choiceTypes_choiceID_fk` FOREIGN KEY (`choiceID`) REFERENCES `choicetypes` (`choiceID`),
  CONSTRAINT `movielist_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  CONSTRAINT `movielist_ibfk_2` FOREIGN KEY (`movieID`) REFERENCES `movies` (`movieID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movieList`
--

LOCK TABLES `movieList` WRITE;
/*!40000 ALTER TABLE `movieList` DISABLE KEYS */;
/*!40000 ALTER TABLE `movieList` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movieLocations`
--

DROP TABLE IF EXISTS `movieLocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movieLocations` (
  `movieID` int(11) NOT NULL,
  `serviceID` int(11) DEFAULT NULL,
  PRIMARY KEY (`movieID`),
  KEY `movieLocations_streamingServices_serviceID_fk` (`serviceID`),
  CONSTRAINT `movieLocations_movies_movieID_fk` FOREIGN KEY (`movieID`) REFERENCES `movies` (`movieID`) ON DELETE CASCADE,
  CONSTRAINT `movieLocations_streamingServices_serviceID_fk` FOREIGN KEY (`serviceID`) REFERENCES `streamingservices` (`serviceID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movieLocations`
--

LOCK TABLES `movieLocations` WRITE;
/*!40000 ALTER TABLE `movieLocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `movieLocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `movieID` int(11) NOT NULL AUTO_INCREMENT,
  `movieName` varchar(255) DEFAULT NULL,
  `releaseYear` int(11) DEFAULT NULL,
  `ranking` int(11) DEFAULT NULL,
  PRIMARY KEY (`movieID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streamingServices`
--

DROP TABLE IF EXISTS `streamingServices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streamingServices` (
  `serviceID` int(11) NOT NULL AUTO_INCREMENT,
  `serviceName` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`serviceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streamingServices`
--

LOCK TABLES `streamingServices` WRITE;
/*!40000 ALTER TABLE `streamingServices` DISABLE KEYS */;
/*!40000 ALTER TABLE `streamingServices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userID` bigint(20) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-05-14 12:59:00
