const Router = require('koa-router');
const pool = require('../db');
const { batchTranslate } = require('../utils/baiduTranslate');
const crypto = require('crypto');

const router = new Router({ prefix: '/api/word' });

// 1. 查询音乐词汇（优先查自有数据，无则调用AI翻译）
router.post('/query', async (ctx) => {
  try {
    const { source_word, source_lang } = ctx.request.body;
    if (!source_word || !source_lang) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少参数：source_word 或 source_lang' };
      return;
    }

    // 步骤1：查询核心词汇表
    const [rows] = await pool.execute(
      'SELECT * FROM music_word WHERE source_lang = ? AND source_word = ?',
      [source_lang, source_word]
    );

    if (rows.length > 0) {
      // 自有数据存在，直接返回
      ctx.body = {
        code: 200,
        msg: '查询成功',
        data: rows[0]
      };
      return;
    }

    // 步骤2：自有数据不存在，调用百度翻译
    const translateResult = await batchTranslate(source_word, source_lang);
    // 生成唯一word_id
    const word_id = crypto.createHash('md5').update(`${source_lang}_${source_word}`).digest('hex');
    // 组装数据
    const wordData = {
      word_id,
      source_lang,
      source_word,
      ...translateResult,
      data_source: 'AI翻译',
      professional_mean: `【音乐专业释义】${source_word}（${source_lang}）` // 简化示例，可后续完善
    };

    // 步骤3：存入临时校验表
    const fields = Object.keys(wordData);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(key => wordData[key]);

    await pool.execute(
      `INSERT INTO music_word_temp (${fields.join(',')}) VALUES (${placeholders})`,
      values
    );

    // 返回翻译结果
    ctx.body = {
      code: 200,
      msg: 'AI翻译结果（待校验）',
      data: { ...wordData, check_status: 0 }
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { code: 500, msg: '服务器错误', error: err.message };
  }
});

// 2. 管理员校验AI翻译结果（通过后同步到核心表）
router.post('/check', async (ctx) => {
  try {
    const { word_id, check_status } = ctx.request.body;
    if (!word_id || !check_status) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少参数：word_id 或 check_status' };
      return;
    }

    // 步骤1：查询临时表数据
    const [tempRows] = await pool.execute(
      'SELECT * FROM music_word_temp WHERE word_id = ?',
      [word_id]
    );
    if (tempRows.length === 0) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '临时数据不存在' };
      return;
    }

    const tempData = tempRows[0];
    // 步骤2：校验通过 → 同步到核心表
    if (check_status === 1) {
      // 提取核心字段（排除id、check_status）
      const fields = ['word_id', 'source_lang', 'source_word', 'target_lang_zh', 'target_lang_en', 'target_lang_it', 'target_lang_fr', 'target_lang_de', 'target_lang_ru', 'target_lang_es', 'part_of_speech', 'professional_mean', 'data_source'];
      const placeholders = fields.map(() => '?').join(',');
      const values = fields.map(key => tempData[key]);

      // 先删除已存在的（避免主键冲突），再插入
      await pool.execute('DELETE FROM music_word WHERE word_id = ?', [word_id]);
      await pool.execute(
        `INSERT INTO music_word (${fields.join(',')}) VALUES (${placeholders})`,
        values
      );
    }

    // 步骤3：更新临时表校验状态
    await pool.execute(
      'UPDATE music_word_temp SET check_status = ? WHERE word_id = ?',
      [check_status, word_id]
    );

    ctx.body = {
      code: 200,
      msg: check_status === 1 ? '校验通过，已同步到核心表' : '校验不通过',
      data: { word_id, check_status }
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { code: 500, msg: '服务器错误', error: err.message };
  }
});

module.exports = router;