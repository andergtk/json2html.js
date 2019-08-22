class JSON2HTML {
  static get selfCloseTags() {
    return [
      'area', 'base', 'br', 'col', 'embed', 'hr',
      'img', 'input', 'link', 'meta', 'param', 'source',
      'track', 'wbr', 'command', 'keygen', 'menuitem',
    ];
  }

  static build(json) {
    if (!json) return '';
    const atributes = JSON2HTMLBuilder.attributtes(json);
    if (JSON2HTMLBuilder.isSelfCloseTag(json)) {
      return `<${json.tag} ${atributes}/>`;
    }
    const children = JSON2HTMLBuilder.children(json);
    return `<${json.tag} ${atributes}>${children}</${json.tag}>`;
  }

  static unbuild(html) {
    if (!html) return {};
    const el = document.createElement('html');
    el.innerHTML = html;
    const body = el.querySelector('body');
    if (!body) return {};
    const [first] = body.children;
    if (!first) return {};
    return JSON2HTMLUnbuilder.node2json(first);
  }
}

class JSON2HTMLBuilder {
  static attributtes(json) {
    if (!json.attributes) return '';
    let html = '';
    const keys = Object.keys(json.attributes);
    for (const index in keys) {
      if ({}.hasOwnProperty.call(keys, index)) {
        html += ` ${keys[index]}="${json.attributes[keys[index]]}"`;
      }
    }
    return html;
  }

  static children(json) {
    if (!json.children) return '';
    let html = '';
    for (const index in json.children) {
      if ({}.hasOwnProperty.call(json.children, index)) {
        if (typeof json.children[index] == 'object') {
          html += JSON2HTML.build(json.children[index]);
        } else {
          html +=json.children[index];
        }
      }
    }
    return html;
  }

  static isSelfCloseTag(json) {
    return (JSON2HTML.selfCloseTags.indexOf(json.tag)>-1);
  }
};


class JSON2HTMLUnbuilder {
  static attributes(nodeEl) {
    const attributes = {};
    const keys = Object.keys(nodeEl.attributes);
    for (const index in keys) {
      if ({}.hasOwnProperty.call(keys, index)) {
        const key = keys[index];
        const attribute = nodeEl.attributes[key];
        attributes[attribute.name] = attribute.value;
      }
    }
    return attributes;
  }

  static children(nodeEl) {
    const children = [];
    for (const index in nodeEl.childNodes) {
      const node = nodeEl.childNodes[index];
      if (node.nodeType === Node.ELEMENT_NODE) {
        children.push(JSON2HTMLUnbuilder.node2json(node));
      }
      if (node.nodeType === Node.TEXT_NODE) {
        children.push(node.textContent.trim());
      }
    }
    return children.filter((child) => child);
  }

  static node2json(nodeEl) {
    const attributes = JSON2HTMLUnbuilder.attributes(nodeEl);
    const children = JSON2HTMLUnbuilder.children(nodeEl);
    return {
      tag: nodeEl.tagName.toLowerCase(),
      ...(Object.keys(attributes).length && {attributes}),
      ...(children.length && {children})
    };
  }
};
