// import Queue from 'yocto-queue';

class Node {
	constructor(val) {
		this.value = val;
		this.next = null; // 指针，指向下一个节点
	}
}

// 队列：只能队尾插入、队头出去
class Queue {
    constructor() {
        this.head = null; // 表头，默认指向第一个节点，没有则为null
		this.tail = undefined;
		this.size = 0;
    } 

	clear() {
		this.head = undefined;
		this.tail = undefined;
		this.size = 0;
	}

	// 插入
    enqueue(value) {
		let node = new Node(value);
		// 当前队列空:队头对尾都指向当前新node
		if(this.head === null) {
			this.head = node;
			this.tail = node;
		}
		else {
			// 队尾插入，移动尾指针即可
			this.tail.next = node;
			this.tail = node;
		}

		this.size++;
    }
    

	// 出队
    dequeue() {
		let curHead = this.head;
		if(!curHead) {
			return;
		}
		this.head = curHead.next;
		this.size--;
		return curHead.value;
    }

    get size() {
		return this.size;
    }
}

export default function pLimit(concurrency) {
	validateConcurrency(concurrency);

	const queue = new Queue();
	let activeCount = 0;

	const resumeNext = () => {
		if (activeCount < concurrency && queue.size > 0) {
			queue.dequeue()();
			// Since `pendingCount` has been decreased by one, increase `activeCount` by one.
			activeCount++;
		}
	};

	const next = () => {
		activeCount--;

		resumeNext();
	};

	const run = async (function_, resolve, arguments_) => {
		const result = (async () => function_(...arguments_))();

		resolve(result);

		try {
			await result;
		} catch {}

		next();
	};

	const enqueue = (function_, resolve, arguments_) => {
		// Queue `internalResolve` instead of the `run` function
		// to preserve asynchronous context.
		new Promise(internalResolve => {
			queue.enqueue(internalResolve);
		}).then(
			run.bind(undefined, function_, resolve, arguments_),
		);

		(async () => {
			// This function needs to wait until the next microtask before comparing
			// `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
			// after the `internalResolve` function is dequeued and called. The comparison in the if-statement
			// needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
			await Promise.resolve();

			if (activeCount < concurrency) {
				resumeNext();
			}
		})();
	};

	const generator = (function_, ...arguments_) => new Promise(resolve => {
		enqueue(function_, resolve, arguments_);
	});

	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount,
		},
		pendingCount: {
			get: () => queue.size,
		},
		clearQueue: {
			value() {
				queue.clear();
			},
		},
		concurrency: {
			get: () => concurrency,

			set(newConcurrency) {
				validateConcurrency(newConcurrency);
				concurrency = newConcurrency;

				queueMicrotask(() => {
					// eslint-disable-next-line no-unmodified-loop-condition
					while (activeCount < concurrency && queue.size > 0) {
						resumeNext();
					}
				});
			},
		},
	});

	return generator;
}

function validateConcurrency(concurrency) {
	if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
		throw new TypeError('Expected `concurrency` to be a number from 1 and up');
	}
}