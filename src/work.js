self.onmessage = function (event) {
    const { data } = event;
    // Ví dụ xử lý tính toán phức tạp
    const result = data.num * 2;
    self.postMessage(result);
  };