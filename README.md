# LAM\_Render 🎨

**Lightweight WebGL Renderer** - Real-time 3D Gaussian Splatting for LAM and LAM\_Audio2Expression.

Our rendering engine is now available as an [NPM package](https://www.npmjs.com/package/gaussian-splat-renderer-for-lam).

---

## 🚀 Getting Started

1. Install dependencies
   ```bash
   npm install
   ```


2. Run development server

   ```bash
   npm run dev
   ```
3. Open in browser

<pre class="blog-pre"><div class="code-copy"><span></span><div><div class="code-copy-btn"><i class="next-icon next-icon-copy next-large"></i></div></div></div><code class="blog-code">http://localhost:5173/
</code></pre>

---

## 📦 Core Features

✨ **Key Highlights**

* Real-time rendering support: Interactive LAM avatars with LAM\_Audio2Expression facial animations
* NPM package integration: Use with `npm install gaussian-splat-renderer-for-lam`

## 📦 NPM Package Usage

### Installation

```bash
npm install gaussian-splat-renderer-for-lam
```

### Basic Usage Example

```javascript
    import * as GaussianSplats3D from 'gaussian-splat-renderer-for-lam';
    const div = document.getElementById('GaussianRenderer');
    const assetPath = './asset/arkit/p2-1.zip'; //the real asset address
    const render = await GaussianSplats3D.GaussianSplatRenderer.getInstance(div, assetPath);

```

> 💡 **Advanced Features**
>
> * Facial animations: Load `/asset/test_expression_1s.json` for expression control
> * Custom avatars: Generate new models via [LAM](https://github.com/yourname/LAM) and replace ZIP files

---

## 🔗 Related Projects

copy


| Feature               | Repository                                                                |
| --------------------- | ------------------------------------------------------------------------- |
| Chat integration      | [OpenAvatarChat](https://openavatarchat.example/)                         |
| Avatar generation     | [LAM](https://github.com/yourname/LAM)                                    |
| Expression generation | [LAM\_Audio2Expression](https://github.com/yourname/LAM_Audio2Expression) |

---

## 🧪 Example Files

* Avatar model: `/asset/arkit/p2-1.zip`
* Expression data: `/asset/test_expression_1s.json`

---


## 📜 License

This project is licensed under the MIT License - see [LICENSE](https://aistudio.alibaba-inc.com/LICENSE) for details

---

## 📨 Contact

* Project page: [GitHub](https://github.com/aigc3d/LAM_WebRender.git)
* Email: [your.email@example.com](mailto:doris.yxd@alibaba-inc.com)
