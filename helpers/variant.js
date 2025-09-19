const categoryVariantFields = {
  Smartphones: ["color","ram", "storage", "battery", "camera", "screen", "stock", "price", "sku", "description", "images"],
  Laptops: ["color","ram", "storage", "display", "processor", "gpu", "os", "stock", "price", "sku", "description", "images"],
  Tablets: ["color","ram", "storage", "display", "battery", "os", "stock", "price", "sku", "description", "images"],
  Smartwatches: ["color","battery", "display", "strap", "os", "stock", "price", "sku", "description", "images"],
  "Gaming Consoles": ["storage", "controllerType", "stock", "price", "sku", "description", "images"],
  Headphones: ["type", "connectivity", "color", "stock", "price", "sku", "description", "images"],
  "Bluetooth Speakers": ["battery", "connectivity", "color", "stock", "price", "sku", "description", "images"],
  Televisions: ["display", "resolution", "screenSize", "smartFeatures", "stock", "price", "sku", "description", "images"],
  "Home Theaters": ["channels", "powerOutput", "connectivity", "stock", "price", "sku", "description", "images"],
  Cameras: ["type", "megapixels", "lens", "stock", "price", "sku", "description", "images"],
  Drones: ["camera", "flightTime", "range", "stock", "price", "sku", "description", "images"],
  Printers: ["type", "connectivity", "colorPrint", "stock", "price", "sku", "description", "images"],
  Monitors: ["display", "resolution", "size", "stock", "price", "sku", "description", "images"],
  Projectors: ["resolution", "lumens", "connectivity", "stock", "price", "sku", "description", "images"],
  Routers: ["speed", "ports", "band", "stock", "price", "sku", "description", "images"],
  "Smart Home Devices": ["type", "connectivity", "compatibility", "stock", "price", "sku", "description", "images"],
  "Power Banks": ["capacity", "ports", "stock", "price", "sku", "description", "images"],
  "Storage Devices": ["capacity", "type", "interface", "stock", "price", "sku", "description", "images"],
  "Computer Accessories": ["type", "color", "connectivity", "stock", "price", "sku", "description", "images"],
  "Car Electronics": ["type", "connectivity", "compatibility", "stock", "price", "sku", "description", "images"]
};

module.exports = categoryVariantFields ;
