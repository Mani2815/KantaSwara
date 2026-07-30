import { prisma } from '@server/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function EmailLogsPage() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const queued = await prisma.emailQueue.count({
    where: { status: 'QUEUED' }
  });
  
  const sentToday = await prisma.emailLog.count({
    where: {
      status: 'SENT',
      createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
    }
  });

  const failedToday = await prisma.emailLog.count({
    where: {
      status: { in: ['FAILED', 'BOUNCED'] },
      createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
    }
  });

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Email System Logs</h2>
          <p className="text-neutral-400">Monitor email delivery across the platform.</p>
        </div>
        <Link href="/console/super-admin">
          <span className="text-sm bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg border border-neutral-700 cursor-pointer">
            Back to Dashboard
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-neutral-400 text-sm font-medium mb-1">Sent Today</p>
          <p className="text-3xl font-bold text-green-400">{sentToday}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-neutral-400 text-sm font-medium mb-1">Failed/Bounced Today</p>
          <p className="text-3xl font-bold text-red-400">{failedToday}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-neutral-400 text-sm font-medium mb-1">Queued Retries</p>
          <p className="text-3xl font-bold text-yellow-400">{queued}</p>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-800 text-neutral-300 border-b border-neutral-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Recipient</th>
              <th className="px-6 py-4 font-semibold">Subject</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-800/50">
                <td className="px-6 py-4 text-neutral-200">
                  {log.recipient}
                  {log.recipientName && <span className="text-neutral-500 ml-1 text-xs">({log.recipientName})</span>}
                </td>
                <td className="px-6 py-4 text-neutral-300 truncate max-w-[300px]" title={log.subject}>
                  {log.subject}
                </td>
                <td className="px-6 py-4 text-neutral-400">
                  <span className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-xs">
                    {log.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'SENT' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                    log.status === 'FAILED' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                    log.status === 'BOUNCED' ? 'bg-orange-900/30 text-orange-400 border border-orange-800' :
                    log.status === 'SKIPPED' ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' :
                    'bg-blue-900/30 text-blue-400 border border-blue-800'
                  }`}>
                    {log.status}
                  </span>
                  {log.errorMessage && (
                    <p className="text-red-400 text-xs mt-1 truncate max-w-[200px]" title={log.errorMessage}>
                      {log.errorMessage}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-neutral-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                  No email logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
