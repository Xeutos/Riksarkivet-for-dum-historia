-- Testdata: epoker och quizfrågor. Körs efter schema.sql.
USE Riksarkivet;
SET NAMES utf8mb4;

INSERT INTO quiz (quizId, epok) VALUES
  (1, 'Ancient History'),
  (2, 'Medieval History'),
  (3, 'Modern History');

INSERT INTO questions
  (questionId, quizId, articleId, type, question, questionImageUrl, rightAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3)
VALUES
  (1, 1, 7, 'multiple_choice', 'Where was the Antikythera mechanism discovered in 1901?', NULL, 'In a shipwreck', 'Inside a pyramid', 'Under a Roman temple', 'In a volcanic cave'),
  (2, 1, 7, 'multiple_choice', 'What did the ancient Greeks use the Antikythera mechanism for?', NULL, 'Predicting astronomical positions and eclipses', 'Counting tax payments', 'Measuring the depth of the sea', 'Timing chariot races'),
  (3, 1, 7, 'true_false', 'The Antikythera mechanism could predict eclipses decades in advance.', NULL, 'True', 'False', NULL, NULL),
  (4, 1, 9, 'multiple_choice', 'Roughly when was the Phoenician alphabet developed?', NULL, 'Around 1050 BC', 'Around 3000 BC', 'Around 500 BC', 'Around 300 AD'),
  (5, 1, 9, 'multiple_choice', 'What made the Phoenician alphabet so revolutionary?', NULL, 'It used a simple phonetic system instead of complex ideograms', 'It was the first script ever carved in stone', 'It had numbers but no letters', 'It was written from bottom to top'),
  (6, 1, 9, 'true_false', 'Very few modern alphabets have any connection to the Phoenician alphabet.', NULL, 'False', 'True', NULL, NULL),
  (7, 2, 1, 'multiple_choice', 'Why did people in 15th-century Europe eat mummies?', NULL, 'They believed it worked as medicine', 'As a delicacy at royal feasts', 'As part of a religious ritual', 'To survive a famine'),
  (8, 2, 1, 'multiple_choice', 'Which of these ailments was eating mummy supposed to cure?', NULL, 'Headaches', 'Broken bones', 'Bad breath', 'Baldness'),
  (9, 2, 3, 'multiple_choice', 'Why were the rats of Autun summoned to court?', NULL, 'For destroying barley crops', 'For spreading the plague', 'For stealing from the church', 'For biting the bishop'),
  (10, 2, 3, 'multiple_choice', 'Who defended the rats of Autun in court?', NULL, 'A young lawyer, Bartholomé Chassenée', 'The local bishop', 'The town''s rat catcher', 'Nobody – the rats represented themselves'),
  (11, 2, 3, 'true_false', 'The rats of Autun were found guilty.', NULL, 'False', 'True', NULL, NULL),
  (12, 2, 6, 'multiple_choice', 'In 15th-century Germany, how could couples settle severe marital disputes?', NULL, 'Through trial by combat', 'With a game of chess', 'By asking the king to decide', 'With a cooking contest'),
  (13, 2, 6, 'true_false', 'The marital duels had special handicap rules to level the playing field.', NULL, 'True', 'False', NULL, NULL),
  (14, 3, 2, 'multiple_choice', 'Liechtenstein sent 80 soldiers to the Austro-Prussian War in 1866. How many came home?', NULL, '81', '80', '40', '0'),
  (15, 3, 2, 'true_false', 'Liechtenstein took part in the Austro-Prussian War.', NULL, 'True', 'False', NULL, NULL),
  (16, 3, 4, 'multiple_choice', 'How were the 1897 chess matches between the US House of Representatives and the British House of Commons played?', NULL, 'Via telegraph cables', 'Aboard a ship in the middle of the Atlantic', 'By mailing letters back and forth', 'In person in London'),
  (17, 3, 5, 'multiple_choice', 'Where are spy ''honey traps'' moving today?', NULL, 'Into cyber warfare and deepfakes', 'Into reality TV', 'Into professional sports', 'Back to handwritten love letters'),
  (18, 3, 8, 'multiple_choice', 'In 1989, what did Pepsi briefly own more of than most countries?', NULL, 'Warships', 'Gold reserves', 'Oil fields', 'Satellites'),
  (19, 3, 10, 'multiple_choice', 'How many soldiers were sent to deal with roughly 20,000 emus in 1932?', NULL, 'Three', 'Thirty', 'Three hundred', 'Three thousand'),
  (20, 3, 10, 'true_false', 'The Australian army won the Great Emu War.', NULL, 'False', 'True', NULL, NULL),
  (21, 3, 11, 'multiple_choice', 'In the 1960s, the CIA implanted listening devices in which animal to spy on Soviet embassies?', NULL, 'Cats', 'Pigeons', 'Dogs', 'Dolphins');