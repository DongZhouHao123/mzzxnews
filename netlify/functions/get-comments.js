// netlify/functions/get-comments.js
const fetch = require('node-fetch');

exports.handler = async () => {
  const formId = process.env.NETLIFY_FORM_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!formId || !token) {
    return { statusCode: 500, body: 'Missing Netlify credentials' };
  }

  try {
    const response = await fetch(
      `https://api.netlify.com/api/v1/forms/${formId}/submissions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch submissions');
    const submissions = await response.json();

    // 提取需要的字段，并过滤掉垃圾评论
    const comments = submissions
      .filter(sub => sub.state !== 'spam')
      .map(sub => ({
        name: sub.data.name,
        message: sub.data.message,
        created_at: sub.created_at,
      }));

    return {
      statusCode: 200,
      body: JSON.stringify(comments),
    };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};