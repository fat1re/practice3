-- Таблица Feedback (Отзывы)
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repair_request_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  client_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (repair_request_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
  INDEX idx_repair_request (repair_request_id),
  INDEX idx_created (created_at)
);

-- Таблица SpecialistStats (вью или таблица)
CREATE TABLE specialist_stats (
  id INT PRIMARY KEY,
  fio VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  completed_requests INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  role VARCHAR(50),
  
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
