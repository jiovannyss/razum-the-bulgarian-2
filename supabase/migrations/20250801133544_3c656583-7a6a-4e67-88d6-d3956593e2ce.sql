-- Тест заявка - стартираме sync за competitions да видим какво дава новия план
SELECT * FROM (
  VALUES ('test_sync_competitions')
) AS test(message);