const { Hono } = require('hono');
const jwt = require('jsonwebtoken');

const messageRoute = (prisma) => {
    const message = new Hono();

    const authenticate = async (ctx, next) => {
      const authHeader = ctx.req.headers.get('Authorization');
      if (!authHeader) return ctx.json({ message: 'No token provided' }, 401);
  
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, 'your_secret_key');
        ctx.req.userId = decoded.userId;
        await next();
      } catch (err) {
        return ctx.json({ message: 'Invalid token' }, 401);
      }
    };
  
    message.post('/', authenticate, async (ctx) => {
      const { message: content } = await ctx.req.json();
  
      const post = await prisma.post.create({
        data: {
          userId: ctx.req.userId,
          content,
          likes: 0,
        },
      });
  
      return ctx.json({ message: 'Post created', postId: post.id });
    });
  
    message.get('/:id', async (ctx) => {
      const { id } = ctx.req.param();
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id, 10) },
        include: { user: true },
      });
  
      if (!post) return ctx.json({ message: 'Post not found' }, 404);
  
      return ctx.json(post);
    });
  
    message.post('/like', authenticate, async (ctx) => {
      const { postId } = await ctx.req.json();
  
      await prisma.like.create({
        data: {
          userId: ctx.req.userId,
          postId,
        },
      });
  
      const post = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
  
      return ctx.json({ message: 'Post liked', post });
    });
  
    message.post('/:id/comment', authenticate, async (ctx) => {
      const { id } = ctx.req.param();
      const { content } = await ctx.req.json();
  
      const comment = await prisma.comment.create({
        data: {
          userId: ctx.req.userId,
          postId: parseInt(id, 10),
          content,
        },
      });
  
      return ctx.json({ message: 'Comment added', commentId: comment.id });
    });
  
    message.get('/:id/comments', async (ctx) => {
      const { id } = ctx.req.param();
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(id, 10) },
        include: { user: true },
      });
  
      return ctx.json(comments);
    });
  
    return message;
  };
module.exports= { messageRoute };
