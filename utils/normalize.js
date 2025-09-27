function normalizeWithTemplate(obj, template) {
  if (obj == null) return obj;
  const out = Array.isArray(obj) ? [] : {};

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeWithTemplate(item, template));
  }

  // Copy existing properties first
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === 'object' && !Buffer.isBuffer(val)) {
      // If there is a nested template, use it; otherwise, keep as-is
      const nestedTemplate = template && typeof template === 'object' ? template[key] : undefined;
      out[key] = normalizeWithTemplate(val, nestedTemplate);
    } else {
      out[key] = val;
    }
  }

  // Now ensure template keys exist
  if (template && typeof template === 'object' && !Array.isArray(template)) {
    for (const [key, defaultVal] of Object.entries(template)) {
      if (out[key] === undefined || out[key] === null) {
        // Business rule: if missing, put empty string for primitives;
        // for objects/arrays, deep clone the template default
        if (defaultVal && typeof defaultVal === 'object') {
          out[key] = Array.isArray(defaultVal) ? [] : normalizeWithTemplate({}, defaultVal);
        } else {
          out[key] = '';
        }
      } else if (defaultVal && typeof defaultVal === 'object') {
        // If key exists and is object, make sure nested keys are filled
        out[key] = normalizeWithTemplate(out[key], defaultVal);
      }
    }
  }

  return out;
}

module.exports = { normalizeWithTemplate };
