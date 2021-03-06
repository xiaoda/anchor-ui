import escape from './escape'

class Utils {
  constructor () {
    this.generateCode.bind(this)
  }

  /**
   * 伪链式操作
   *
   * 使用姿势：utils.chain('text', 'utilA', ['utilB', 'paramA', 'paramB'], customUtil)
   */
  chain (...args) {
    if (args.length < 2) return args[0]
    let major = args.shift()

    args.forEach((ring) => {
      let func
      let params

      if (Array.isArray(ring)) {
        func = ring.shift()
        params = [major, ...ring]
      } else {
        func = ring
        params = [major]
      }

      if (this[func] !== undefined) {
        func = this[func].bind(this)
      }

      major = func(...params)
    })

    return major
  }

  getSelector (el) {
    return el instanceof jQuery ? el : $(el)
  }

  generateCode () {
    let _this = this
    // 暴露 html 到前端页面
    $('.bs-example').each(function (key, dom) {
      let $this = $(this)
      // 是否进行代码暴露
      if (!$this.attr('data-no-generated')) {
        let parsedHtml = '', $dom = $(dom)
        // 对 bootstrap-select 插件代码进行差异化处理
        if ($dom.attr('data-code-type') === 'selectpicker') {
          // 获取.selectpicker DOM 节点，并在相邻 DOM 间插入回车换行符
          parsedHtml = _this.getHtml($dom.find('.selectpicker')).replace(/\/select>[ |\r|\n]*<select/gm, '/select>\r\n<select')
          // 转义 DOM 节点
          parsedHtml = _this.parseHtmlCode(parsedHtml)
        } else {
          parsedHtml = _this.parseHtmlCode($dom.html())
        }
        // 高亮代码（基于 highlight 插件）
        $dom.next('figure.highlight').find('code').html(parsedHtml)
      }
    })
    this.highlightCode()
  }

  /* 代码高亮 */
  highlightCode (el = 'figure.highlight code') {
    let $el = this.getSelector(el)
    $el.each(function (i, block) {
      hljs.highlightBlock(block)
    })
  }

  /* 插入代码标签 */
  insertCode (code) {
    return `<pre><code>${code}</code></pre>`
  }

  /* 将html转化为code并美化 */
  parseHtmlCode (html, options = {}) {
    let code = html

    // base64图片替换为...
    code = code.replace(/data:image\/svg\+xml;base64[^"]+/g, '...')

    // 删掉空行和整段末尾的空格
    code = code.replace(/^\s*[\r\n]/gm, '').replace(/^\s*$/gm, '')

    let codeArr = code.split(/\r?\n/)

    // 首行和末行的开头空格数
    let firstLineSpaceLen = code.match(/^\s*/)[0].length
    let lastLineSpaceLen = codeArr[codeArr.length - 1].match(/^\s*/)[0].length

    // 取较大的空格数并删除每行开头的此数量的空格
    let spaceLen = Math.max(firstLineSpaceLen, lastLineSpaceLen)
    code = code.replace(new RegExp(`^\\s{${spaceLen}}`, 'gm'), '')

    // 是否在开头加入换行符
    if (options.unshiftNewLine) code = '\r\n' + code

    code = escape.decode(code)
    return code
  }

  /* 获取html内容（包含自身） */
  getHtml (el) {
    let $el = this.getSelector(el)
    let html = $('<div>').append($el.clone()).html()
    return html
  }
}

export default new Utils()
